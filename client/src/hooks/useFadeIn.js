import { useEffect, useRef, useState } from "react";

export default function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Trigger once any part enters the upper 85% of the screen. A percentage
      // threshold never fires for sections taller than the viewport allows.
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
