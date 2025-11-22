import { SignInSchema, SignUpSchema } from "./schema";
import { authClient } from "../../lib/betterAuth";
import { toast } from "sonner";

export const authFunctions = {
  signIn: async ({ email, password }: SignInSchema) => {
    await authClient.signIn
      .email({ email, password })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("Login successful");
        }
      })
      .catch(() => {
        toast.error("Login failed");
      });
  },
  signUp: async ({ email, name, password }: SignUpSchema) => {
    await authClient.signUp
      .email({ email, name, password })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("Login successful");
        }
      })
      .catch(() => {
        toast.error("Login failed");
      });
  },
};
