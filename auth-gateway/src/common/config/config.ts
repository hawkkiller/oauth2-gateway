export const AuthConfig = {
  hydra: {
    adminUrl: process.env.HYDRA_ADMIN_URL,
    publicUrl: process.env.HYDRA_PUBLIC_URL,
  },
  kratos: {
    adminUrl: process.env.KRATOS_ADMIN_URL,
    publicUrl: process.env.KRATOS_PUBLIC_URL,
  },
};
