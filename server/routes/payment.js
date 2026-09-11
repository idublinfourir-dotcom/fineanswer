const express = require("express");
const axios = require("axios");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { collections } = require("../config/db");
const { asyncHandler, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "testbox";
const SSLCOMMERZ_STORE_PASSWD =
  process.env.SSLCOMMERZ_STORE_PASSWD || "qwerty";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL =
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

// SSLCommerz environment:
// - MODE=sandbox: always use sandbox gateway (safe for testing, even in production)
// - MODE=live: use live gateway (requires approved live store + live credentials)
// - default: sandbox in dev, live in production
const isProduction = process.env.NODE_ENV === "production";
const SSLCOMMERZ_MODE =
  process.env.SSLCOMMERZ_MODE || (isProduction ? "live" : "sandbox");

const SSLCOMMERZ_BASE_URL =
  SSLCOMMERZ_MODE === "live"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
const SSLCOMMERZ_API_URL = `${SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`;
const SSLCOMMERZ_VALIDATOR_URL = `${SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php`;

// Validate SSLCommerz IPN callback using Order Validation API
const validateSSLCommerzIPN = async (tranId, valId) => {
  if (!tranId || !valId) return false;
  try {
    const params = new URLSearchParams({
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWD,
      val_id: valId,
      format: "json",
    });
    const response = await axios.get(
      `${SSLCOMMERZ_VALIDATOR_URL}?${params.toString()}`,
    );
    const data = response.data;
    return (
      data?.status === "VALID" &&
      data?.tran_id === tranId &&
      data?.risk_level === "0"
    );
  } catch (error) {
    console.error("[Payment] IPN validation error:", error.message);
    return false;
  }
};

// POST /api/create-payment - Initiate SSLCommerz payment
// Authentication is optional (allows guest payments; linked to account when logged in)
router.post(
  "/create-payment",
  asyncHandler(async (req, res) => {
    const {
      amount,
      currency = "BDT",
      cus_name,
      cus_email,
      cus_phone,
      userId,
      purpose,
    } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: "Amount is required (min 10 BDT)",
      });
    }
    if (amount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Amount exceeds maximum limit (100,000 BDT)",
      });
    }

    // Try to identify logged-in user from optional auth token
    let paidByUserId = userId || null;
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ") && collections.users) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await collections.users.findOne({
          _id: new ObjectId(decoded.userId),
        });
        if (user) paidByUserId = user._id.toString();
      } catch {
        // ignore invalid token; use body data only
      }
    }

    const tranId =
      "TXN" +
      Date.now() +
      Math.random().toString(36).slice(2, 8).toUpperCase();
    const name = cus_name || "Customer";
    const email = cus_email || "customer@example.com";
    const phone = cus_phone || "01711111111";
    const purposeLabel = purpose || "Study Abroad Application Fee";

    const paymentDoc = {
      paymentId: tranId,
      tran_id: tranId,
      amount: Number(amount),
      currency: String(currency).toUpperCase().slice(0, 3),
      status: "pending",
      cus_name: name,
      cus_email: email,
      cus_phone: phone,
      userId: paidByUserId || null,
      purpose: purposeLabel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (collections.payment) {
      await collections.payment.insertOne(paymentDoc);
    }

    const successUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/payment/success`;
    const failUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/payment/fail`;
    const cancelUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/payment/cancel`;

    const params = new URLSearchParams({
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWD,
      total_amount: String(Number(amount).toFixed(2)),
      currency: String(currency).toUpperCase().slice(0, 3),
      tran_id: tranId,
      product_category: "education",
      product_profile: "general",
      product_name: purposeLabel,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      cus_name: name,
      cus_email: email,
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: phone,
      cus_fax: phone,
      ship_name: name,
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
      shipping_method: "NO",
    });

    const response = await axios.post(SSLCOMMERZ_API_URL, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = response.data;
    if (data?.status === "SUCCESS" && data?.GatewayPageURL) {
      return res.json({
        success: true,
        GatewayPageURL: data.GatewayPageURL,
        sessionkey: data.sessionkey,
      });
    }

    return res.status(400).json({
      success: false,
      message: data?.failedreason || "Payment init failed",
    });
  }),
);

// SSLCommerz POSTs to these URLs after payment — validate IPN, update DB, then redirect

// POST /api/payment/success
router.post(
  "/payment/success",
  asyncHandler(async (req, res) => {
    const tranId = req.body?.tran_id;
    const valId = req.body?.val_id;
    const isValid = await validateSSLCommerzIPN(tranId, valId);

    if (collections.payment && tranId) {
      if (isValid) {
        await collections.payment.updateOne(
          { tran_id: tranId },
          { $set: { status: "success", updatedAt: new Date(), val_id: valId } },
        );
      } else {
        console.warn(
          `[Payment] Invalid IPN for tran_id: ${tranId}, val_id: ${valId}`,
        );
      }
    }
    res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/payment/success`);
  }),
);

// POST /api/payment/fail
router.post(
  "/payment/fail",
  asyncHandler(async (req, res) => {
    const tranId = req.body?.tran_id;
    const valId = req.body?.val_id;
    const isValid = await validateSSLCommerzIPN(tranId, valId);

    if (collections.payment && tranId) {
      if (isValid) {
        await collections.payment.updateOne(
          { tran_id: tranId },
          { $set: { status: "fail", updatedAt: new Date(), val_id: valId } },
        );
      } else {
        console.warn(
          `[Payment] Invalid IPN for tran_id: ${tranId}, val_id: ${valId}`,
        );
      }
    }
    res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/payment/fail`);
  }),
);

// POST /api/payment/cancel
router.post(
  "/payment/cancel",
  asyncHandler(async (req, res) => {
    const tranId = req.body?.tran_id;
    const valId = req.body?.val_id;
    const isValid = await validateSSLCommerzIPN(tranId, valId);

    if (collections.payment && tranId) {
      if (isValid) {
        await collections.payment.updateOne(
          { tran_id: tranId },
          { $set: { status: "cancel", updatedAt: new Date(), val_id: valId } },
        );
      } else {
        console.warn(
          `[Payment] Invalid IPN for tran_id: ${tranId}, val_id: ${valId}`,
        );
      }
    }
    res.redirect(302, `${FRONTEND_URL.replace(/\/$/, "")}/payment/cancel`);
  }),
);

module.exports = router;
