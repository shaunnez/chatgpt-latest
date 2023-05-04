import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
  secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
  debug: false,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
  },
  // useSecureCookies: false, // using false while local development
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const valid =
          credentials.username === "admin" &&
          credentials.password === "superstrongpassword123";
        if (valid) {
          return { id: "1", name: "Admin", email: "admin@admin.com" };
        } else {
          return null;
        }
      },
    }),
  ],
};

export default NextAuth({
  secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
  debug: false,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
  },
  useSecureCookies: false, // using false while local development
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const valid =
          credentials.username === "admin" &&
          credentials.password === "superstrongpassword123";
        if (valid) {
          return { id: "1", name: "Admin", email: "admin@admin.com" };
        } else {
          return null;
        }
      },
    }),
  ],
});
