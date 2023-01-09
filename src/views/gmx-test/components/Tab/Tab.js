import React, { useState, useEffect } from "react";

import cx from "classnames";

import "./Tab.css";
import Tooltip from './../Tooltip/Tooltip';

export default function Tab(props) {
  const { options, option, setOption, onChange, type = "block", className, optionLabels, icons } = props;
  
  const onClick = (opt) => {
    if (setOption) {
      setOption(opt);
    }
    if (onChange) {
      onChange(opt);
    }
  };

  return (
    <div className={cx("Tab", type, className)}>
      {options.map((opt) => {
        const label = optionLabels && optionLabels[opt] ? optionLabels[opt] : opt;
        let disabledNode;
        
        if (props.disabledList) {
          props.disabledList.forEach(el => {
            if (el.label === label && el.disabled) {
              disabledNode = (
                <div className={cx("Tab-option", "tab-tooltip-container")} onClick={() => {return}} key={opt}>
                  <Tooltip
                    className="tab-tooltip nowrap"
                    position="right-bottom"
                    enabled={true}
                    handle=""
                    renderContent={() => {
                      return (
                        <div>
                          <span className='spacing'>Y</span>ou can't open<br className="br-mobile" /> a long/short position<br /> at the same time
                        </div>
                      );
                    }} />
                  {icons && icons[opt] && <img className="Tab-option-icon" src={opt === option ? icons[opt + '_active'] : icons[opt]} alt={option} />}
                  {label}
                </div>
              );
            }
          })
        }

        if (disabledNode) {
          return disabledNode;
        }
        
        return (
          <div className={cx("Tab-option", "muted", { active: opt === option })} onClick={() => onClick(opt)} key={opt}>
            {icons && icons[opt] && <img className="Tab-option-icon" src={opt === option ? icons[opt + '_active'] : icons[opt]} alt={option} />}
            {label}
          </div>
        );
      })}
    </div>
  );
}
