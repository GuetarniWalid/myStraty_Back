"use strict";
const User = use("App/Models/User");
const Setting = use("App/Models/Setting");
const Exchange = use("App/Models/Exchange");
const Strategy = use("App/Models/Strategy");
const Napoleon = use("App/Models/Napoleon");
const Subscription = use("App/Models/Subscription");
const { validate } = use("Validator");
const Mail = use("Mail");
const Env = use("Env");
const Token = use("App/Models/Token");
const { decode } = require("jws");
const moment = require("moment");

/**
 * @memberof Controllers.Http
 * @classDesc This is the Controller for routes that begin by "[Domain name]/api/v1/user" or "[Domain name]/api/v1/login" . Desserve data related to user.
 */
class UserController {
  /**
   * @description Gives user data
   * @param {ctx} ctx - Context object
   * @param {ctx} ctx.auth.user.id - User's id
   * @returns {user} All user's data
   */
  async get({ auth }) {
    try {
      const user = await User.find(auth.user.id);
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @description Update user data
   * @param {ctx} ctx - Context object
   * @param {number|string} ctx.auth.user.id - User's id
   * @param {string} [ctx.request.email] - User's email
   * @param {string} [ctx.request.username] - User's username
   * @param {string} [ctx.request.date_of_birth] - User's date of birth
   * @param {boolean} [ctx.request.male] - If user is male
   * @returns {success} - If user has been updated successfully
   * @throws {formValidationFailed}
   */
  async update({ request, auth }) {
    const { email, username } = request.all();
    const user = await User.find(auth.user.id);

    //only if post is about username and email
    if (!(email === undefined) && !(username === undefined)) {
      //rules on email apply only if the email is different from the current one
      let rules;
      if (user.email === email && user.username === username) rules = {};
      else if (user.email === email && user.username !== username) {
        rules = {
          username: "required|unique:users,username|min:4",
        };
      } else if (user.email !== email && user.username === username) {
        rules = {
          email: "required|email|unique:users,email",
        };
      } else if (user.email !== email && user.username !== username) {
        rules = {
          email: "required|email|unique:users,email",
          username: "required|unique:users,username|min:4",
        };
      }

      const messages = {
        "email.required": "Vous devez entrer un email",
        "email.email": "Cette email n'est pas valide",
        "email.unique": "Cette email existe déjà",
        "username.required": "Vous devez fournir un pseudo",
        "username.unique": "Ce pseudo est déjà utilisé",
        "username.min": "Plus de 3 charactères recquis",
      };

      const validation = await validate(request.all(), rules, messages);

      //if validation fails return error message
      if (validation.fails()) {
        return {
          success: false,
          details: { ...validation.messages()[0], type: "formValidation" },
        };
      }
    }

    //if everything is ok
    try {
      const body = request.post();
      const keys = Object.keys(body);
      keys.forEach((key) => (user[key] = body[key]));
      await user.save();
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  /**
   * @description Save user credenties for registration and send him a validation mail
   * @param {ctx} ctx - Context object
   * @param {string} ctx.request.email - User's email
   * @param {string} ctx.request.password - User's password
   * @param {string} ctx.request.username - User's username
   * @returns {registrationValidation} - Object
   * @throws {formValidationFailed}
   */
  async inscription({ request, auth }) {
    const { email, password, username } = request.all();
    const rules = {
      email: "required|email|unique:users,email",
      password: "required|min:6",
      username: "required|unique:users,username|min:4",
    };

    const messages = {
      "email.required": "Vous devez entrer un email",
      "email.email": "Cette email n'est pas valide",
      "email.unique": "Cette email existe déjà",
      "password.min": "Plus de 5 charactères recquis",
      "password.required": "Vous devez fournir un mot de passe",
      "username.required": "Vous devez fournir un pseudo",
      "username.unique": "Ce pseudo est déjà utilisé",
      "username.min": "Plus de 3 charactères recquis",
    };

    const validation = await validate(request.all(), rules, messages);

    //if validation fails return error message
    if (validation.fails()) {
      return {
        success: false,
        details: validation.messages()[0],
      };
    }

    //else mutiple table for this user are create in database
    //user table
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    await user.save();

    //subscription table
    const subscription = new Subscription();
    subscription.user_id = user.id;
    subscription.date_end_subscription = moment()
      .add(1, "M")
      .format("YYYY-MM-DD");
    await subscription.save();

    //setting table
    const setting = new Setting();
    setting.user_id = user.id;
    await setting.save();

    //exchange table
    const exchange = new Exchange();
    exchange.name = "binance";
    exchange.user_id = user.id;
    await exchange.save();

    //strategy table
    //first we need Napoleon table data
    const napoleons = await Napoleon.all();
    napoleons.toJSON().map(async (napoleonStrat) => {
      const strategy = new Strategy();
      strategy.exchange_id = exchange.id;
      strategy.strategy = napoleonStrat.strategy;
      strategy.frequency = napoleonStrat.frequency;
      strategy.title = napoleonStrat.title;
      await strategy.save();
    });

    //in the mail for the user, a link with token is send to validate the user's mail
    //the link point to 'login/inscription/validation' route

    //first: we create a token and save it in database
    const { token, type } = await auth.authenticator('jwt').generate(user);
    const tokenTable = new Token();
    tokenTable.type = type;
    tokenTable.token = token;
    tokenTable.user_id = user.id;
    await tokenTable.save();

    try {
      const text = `
                  <h3>Bienvenue sur Trady<h3>
                  <p>Pour finaliser votre inscription cliquez <a href='${Env.get(
                    "BACK_URL"
                  )}/api/v1/login/inscription/validation/${token}'>ici</a>.<br>
                      Vous serez alors redirigé vers notre site</p>
              `;

      await Mail.raw(text, (message) => {
        message.from(Env.get("MAIL_USERNAME"));
        message.to(email);
        message.subject("Inscription sur Trady");
      });
    } catch (error) {
      return {
        success: false,
        details: {
          type: "send_email",
          message: "an error occur, email could not be sent",
        },
      };
    }
    return {
      success: true,
      type: "registration",
    };
  }

  /**
   * @description Active the user after he verify his email
   * @param {ctx} ctx - Context object
   * @param {string} ctx.params.token - The token to verify email validity
   * @param {Function} ctx.response.route - Function that redirect to an url
   * @returns {void}
   */
  async validation({ params, response }) {
    const { token } = params;
    const id = decode(token).payload.uid;
    const user = await User.find(id);
    user.active = true;
    await user.save();

    //redirection to front index
    response.route(`${Env.get("FRONT_URL")}?validation=true`);
  }

  /**
   * @description Validates the user credenties to log in
   * @param {ctx} ctx - Context object
   * @param {string} ctx.request.email - User's email
   * @param {string} ctx.request.password - User's password
   * @param {Function} ctx.auth.attempt - Create a JWT token with user id and an expiration time
   * @returns {connexionResponse} - Object
   * @throws {formValidationFailed}
   */
  async connexion({ request, auth }) {
    const { email, password } = request.all();

    //if user has already an open session, we close it
    try {
      await auth.check()
      await auth.logout()
    } catch(e) {
      //nothing
    }
    
    let jwtToken;
    try {
      const user = await auth.attempt(email, password)
      //expose a token that expires in 1hour
      const { token } = await auth.authenticator('jwt').generate(user, {
        expireIn: 3600000,
      });      
      jwtToken = token
    }
    catch(e) {
      return {
        details: {
          field: e.name === 'UserNotFoundException' ? 'email' : 'password'
        }
      }
    }

    try {
      await User.findByOrFail({
        email: email,
        active: true,
      });
      return {
        success: true,
        type: "connexion",
        token: jwtToken,
      };
    } catch (e) {
      return {
        success: false,
        type: "connexion",
        message: "user not active",
      };
    }
  }

  /**
   * @description Verify user's email and send a mail to update his password
   * @param {ctx} ctx - Context object
   * @param {string} ctx.request.email - User's email
   * @param {string} ctx.request.password - User's password
   * @param {boolean} ctx.request.updatePassword - Iff the  the user want update his password
   * @param {Function} ctx.auth.getUser - Find a user thanks a JWT token
   * @returns {success} - If everything went well
   * @throws {formValidationFailed}
   */
  async forget({ request, auth }) {
    const { email, password, updatePassword } = request.all();

    //only if user already verify his mail
    if (updatePassword) {
      const rules = {
        password: "required|min:6",
      };

      const messages = {
        "password.min": "Plus de 5 charactères recquis",
        "password.required": "Vous devez fournir un mot de passe",
      };

      const validation = await validate(
        { password: password },
        rules,
        messages
      );

      //if validation fails return error message
      if (validation.fails()) {
        return {
          success: false,
          details: validation.messages()[0],
        };
      }

      //get user instance by token
      const userByToken = await auth.authenticator('jwt').getUser();
      //get user instance by mail
      let user;
      try {
        user = await User.findByOrFail("email", email);
      } catch (e) {
        return {
          success: false,
          details: {
            field: "email",
            message: "Ce mail n'existe pas",
          },
        };
      }

      //if mail and token do not refer to the same user
      if (userByToken.id !== user.id) {
        return { success: false };
      }

      //else we update the password
      user.password = password;
      await user.save();

      return { success: true };
    }

    //if no password present, this is the case when the user sends his email without having been verified before
    //we create a mail and send to him
    try {
      const user = await User.findByOrFail("email", email);

      //we create a user token and save it
      const { token, type } = await auth.authenticator('jwt').generate(user);
      const tokenTable = await Token.findOrCreate(
        { user_id: user.id },
        { user_id: user.id }
      );
      tokenTable.token = token;
      tokenTable.type = type;
      await tokenTable.save();

      const text = `
                <h3>Vous avez oublié votre mot de passe ?<h3>
                <p>Pour le reinitialiser cliquez sur ce <a href='${Env.get(
                  "BACK_URL"
                )}/api/v1/login/forget/validation/${token}'>lien</a>.<br>
                    Vous serez alors redirigé vers notre site</p>
            `;

      await Mail.raw(text, (message) => {
        message.from(Env.get("MAIL_USERNAME"));
        message.to(email);
        message.subject("Trady: Mot de passe oublié");
      });

      return { success: true };
    } catch (e) {
      return {
        success: false,
        details: {
          message: "Ce mail n'existe pas",
          field: "email",
        },
      };
    }
  }

  /**
   * @description Verify the token present in users email and redirect him to login page
   * @param {ctx} ctx - Context object
   * @param {string} ctx.params.token - Context object
   * @param {string} ctx.response.route - Function that redirect to an url
   * @returns {void}
   */
  async forgetValidation({ params, response }) {
    const { token } = params;
    try {
      await Token.findByOrFail("token", token);
      //redirection to front index
      response.route(
        `${Env.get("FRONT_URL")}?validation=true&forget=true&token=${token}`
      );
    } catch (e) {
      response.route(`${Env.get("FRONT_URL")}?validation=false&forget=true`);
    }
  }

  /**
   * @description Resend a registration's email to user
   * @param {ctx} ctx - Context oject
   * @param {string} ctx.request.email - User's email
   * @returns {success} - If everything went well
   */
  async resendMail({ request }) {
    const { email } = request.all();

    //we get the token with email
    let user;
    try {
      user = await User.findByOrFail("email", email);
    } catch (e) {
      return { success: false };
    }
    const token = await Token.findBy({ user_id: user.id });
    const text = `
                <h3>Bienvenue sur Trady<h3>
                <p>Pour finaliser votre inscription cliquez <a href='${Env.get(
                  "BACK_URL"
                )}/api/v1/login/inscription/validation/${
      token.token
    }'>ici</a>.<br>
                    Vous serez alors redirigé vers notre site</p>
            `;

    await Mail.raw(text, (message) => {
      message.from(Env.get("MAIL_USERNAME"));
      message.to(email);
      message.subject("Inscription sur Trady");
    });

    return { success: true };
  }


  async logout({auth}) {
    await auth.logout()
  }
}


module.exports = UserController;
