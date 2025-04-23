import { useEffect } from "react";

declare global {
  interface Window {
    initEmbeddedMessaging?: () => void;
  }
}

const SALESFORCE_ORG_ID = "00DgL000002K5FJ";
const SALESFORCE_DEPLOYMENT_NAME = "CC_Support";
const SALESFORCE_URL = "https://orgfarm-a22cce4222-dev-ed.develop.my.site.com/ESWCCSuuport1745362314763";
const SALESFORCE_SCRT2_URL = "https://orgfarm-a22cce4222-dev-ed.develop.my.salesforce-scrt.com";

const SalesforceChatWidget = () => {
  useEffect(() => {
    // Define the init function globally for Salesforce to call
    window.initEmbeddedMessaging = function () {
      try {
        // @ts-ignore
        window.embeddedservice_bootstrap.settings.language = "en_US";
        // @ts-ignore
        window.embeddedservice_bootstrap.init(
          SALESFORCE_ORG_ID,
          SALESFORCE_DEPLOYMENT_NAME,
          SALESFORCE_URL,
          {
            scrt2URL: SALESFORCE_SCRT2_URL,
          }
        );
      } catch (err) {
        console.error("Error loading Embedded Messaging: ", err);
      }
    };

    // Inject the Salesforce bootstrap script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `${SALESFORCE_URL}/assets/js/bootstrap.min.js`;
    script.onload = window.initEmbeddedMessaging;
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
      window.initEmbeddedMessaging = undefined;
    };
  }, []);

  return null;
};

export default SalesforceChatWidget;
