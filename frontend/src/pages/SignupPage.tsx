const Signup = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create your account</h2>
          <p>Join and start exploring books</p>
        </div>

        <form className="auth-form">
          <div className="auth-field">
            <label htmlFor="username-field">
              Username <span className="required">*</span>
            </label>
            <input id="username-field" type="text" />
          </div>

          <div className="auth-field">
            <label htmlFor="email-field">
              Email <span className="required">*</span>
            </label>
            <input id="email-field" type="email" />
          </div>

          <div className="auth-field">
            <label htmlFor="password-field">
              Password <span className="required">*</span>
            </label>
            <input id="password-field" type="password" />
          </div>

          <button type="submit" className="auth-submit ">
            Sign up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <a href="/login"> Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
