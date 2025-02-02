import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import React, { useState } from "react";
import { authUser } from "@/model/auth/user";
import { useFirebaseAuth } from "@/hook/auth/useFirebaseAuth";

const Auth = () => {
  const [input, setInput] = useState<authUser>({
    userName: "",
    email: "",
    password: "",
  });

  const [isLogin, setIsLogin] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const response = useFirebaseAuth(input, isLogin, isSubmit);
  const handleSubmit = async () => {
    console.log("handleSubmit", isSubmit);
    setIsSubmit(!isSubmit);
  };

  return (
    <div>
      <AccountCircleIcon sx={{ width: 80, height: 80 }} />

      {/* Login / Register Title */}
      <h4 className="mb-3">{isLogin ? "Sign in" : "Create Account"}</h4>

      {/* Form */}
      {!isLogin && (
        <div className="mb-3">
          <input
            type="text"
            name="userName"
            className="form-control"
            placeholder="User Name"
            value={input?.userName}
            onChange={(e) => handleInputChange(e)}
            required
          />
        </div>
      )}

      <div className="mb-3">
        <input
          type="email"
          name="email"
          className="form-control"
          placeholder="Email Address"
          value={input?.email}
          onChange={(e) => handleInputChange(e)}
          required
        />
      </div>

      <div className="mb-3">
        <input
          type="password"
          name="password"
          className="form-control"
          placeholder="Password"
          onChange={(e) => handleInputChange(e)}
          value={input?.password}
          required
        />
      </div>

      <button className="btn btn-primary w-100" onClick={() => handleSubmit()}>
        {isLogin ? "Sign In" : "Register"}
      </button>

      {/* Toggle Login/Register */}
      <p className="mt-3">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <a
          href="#"
          className="text-primary"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Register" : "Sign In"}
        </a>
      </p>
      {response && <h2>{response}</h2>}
    </div>
  );
};

export default Auth;
