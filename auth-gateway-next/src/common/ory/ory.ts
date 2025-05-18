import { Configuration, OAuth2Api } from "@ory/hydra-client";
import { AuthConfig } from "../config/config";
import { FrontendApi } from "@ory/kratos-client";

const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: AuthConfig.hydra.adminUrl,
  })
);

const kratosAdmin = new FrontendApi(
  new Configuration({
    basePath: AuthConfig.kratos.adminUrl,
  })
);

const kratosPublic = new FrontendApi(
  new Configuration({
    basePath: AuthConfig.kratos.publicUrl,
  })
);

export { hydraAdmin, kratosAdmin, kratosPublic };
