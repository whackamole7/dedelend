import React, { useRef, useEffect } from "react";
import cx from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import { MdClose } from "react-icons/md";

import "./Modal.scss";
import useLockBodyScroll, { TOUCH_MOVE_CONTAINER_CLASS_NAME } from "../../lib/useLockBodyScroll";

export default function Modal(props) {
  const { isVisible, setIsVisible, className, zIndex, onAfterOpen, disableBodyScrollLock, allowContentTouchMove, isNifty } =
    props;

  const modalRef = useRef(null);

  useLockBodyScroll(modalRef, isVisible, {
    disableLock: false,
    allowTouchMove: allowContentTouchMove,
  });


  useEffect(() => {
    function close(e) {
      if (e.keyCode === 27) {
        setIsVisible(false);
      }
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [setIsVisible]);

  useEffect(() => {
    if (typeof onAfterOpen === "function") onAfterOpen();
  }, [onAfterOpen]);

  const fadeVariants = {
    hidden: { zIndex: -2, opacity: 0 },
    visible: { zIndex: 900, opacity: 1 },
  };
  const niftyFadeVariants = {
    hidden: {
      transform: 'rotateX(-60deg)',
      opacity: 0,
    },
    visible: {
      transform: 'rotateX(0)',
      opacity: 1,
    }
  }

  /* if (!isVisible) {
    return <></>;
  } */

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cx("Modal", className)}
          style={{ zIndex }}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeVariants}
          transition={{ duration: 0 }}
        >
          <div
            className="Modal-backdrop"
            style={{
              overflow: isVisible ? "hidden" : "visible",
              position: "fixed",
            }}
            onClick={() => setIsVisible(false)}
          ></div>

          <div className={isNifty && "Modal-content-wrapper"}>
            <motion.div
              className={cx("Modal-content")}
              style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 0' }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={isNifty && niftyFadeVariants}
              transition={{ duration: 0 }}
            >
              <div className="Modal-title-bar">
                <div className="Modal-title">{props.label}</div>
                <div className="Modal-close-button" onClick={() => setIsVisible(false)}>
                  <MdClose fontSize={20} className="Modal-close-icon" />
                </div>
              </div>
              <div className="divider" />
              <div className={cx("Modal-body", TOUCH_MOVE_CONTAINER_CLASS_NAME)} ref={modalRef}>
                {props.children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
