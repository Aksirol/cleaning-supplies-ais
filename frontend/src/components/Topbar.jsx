const Topbar = ({ title, subtitle, buttonText, onButtonClick }) => {
  return (
    <div className="topbar">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-sub">{subtitle}</div>
      </div>
      <div className="topbar-actions">
        {buttonText && (
          <button className="btn btn-primary" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;