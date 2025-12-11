import React from "react";
import InstallationEditor from "../site/InstallationEditor";

const PageInstalation = ({ token }) => {
  return (
    <div>
      <InstallationEditor token={token} />
    </div>
  );
};

export default PageInstalation;

