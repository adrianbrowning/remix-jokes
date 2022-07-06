import type {
    ActionFunction,
    LinksFunction, MetaFunction
} from "@remix-run/node";
import {json} from "@remix-run/node";
import {
    useActionData,
    Link,
    useSearchParams, Form
} from "@remix-run/react";

import {db} from "~/utils/db.server";
import {login, createUserSession} from "~/utils/session.server";
import stylesUrl from "~/styles/login.css";

export const links: LinksFunction = () => {
    return [{rel: "stylesheet", href: stylesUrl}];
};

export const meta: MetaFunction = () => {
    return {
        title: "Remix Jokes | Login",
        description:
            "Login to submit your own jokes to Remix Jokes!",
    };
};

function validateUsername(username: unknown) {
    if (typeof username !== "string" || username.length < 3) {
        return `Usernames must be at least 3 characters long`;
    }
}

function validatePassword(password: unknown) {
    if (typeof password !== "string" || password.length < 6) {
        return `Passwords must be at least 6 characters long`;
    }
}

function validateUrl(url: any) {
    console.log(url);
    let urls = ["/jokes", "/", "https://remix.run"];
    if (urls.includes(url)) {
        return url;
    }
    return "/jokes";
}

type ActionData = {
    formError?: string;
    fieldErrors?: {
        username: string | undefined;
        password: string | undefined;
    };
    fields?: {
        loginType: string;
        username: string;
        password: string;
    };
};

const badRequest = (data: ActionData) =>
    json(data, {status: 400});

export const action: ActionFunction = async ({
                                                 request
                                             }) => {
    const form = await request.formData();
    const loginType = form.get("loginType");
    const username = form.get("username");
    const password = form.get("password");
    const redirectTo = validateUrl(
        form.get("redirectTo") || "/jokes"
    );
    if (
        typeof loginType !== "string" ||
        typeof username !== "string" ||
        typeof password !== "string" ||
        typeof redirectTo !== "string"
    ) {
        return badRequest({
            formError: `Form not submitted correctly.`
        });
    }

    const fields = {loginType, username, password};
    const fieldErrors = {
        username: validateUsername(username),
        password: validatePassword(password)
    };
    if (Object.values(fieldErrors).some(Boolean))
        return badRequest({fieldErrors, fields});

    switch (loginType) {
        case "login": {
            const user = await login({ username, password });
            console.log({ user });
            if (!user) {
                return badRequest({
                    fields,
                    formError: `Username/Password combination is incorrect`,
                });
            }
            return createUserSession(user.id, redirectTo);
            // return badRequest({
            //     fields,
            //     formError: "Not implemented"
            // });
        }
        case "register": {
            const userExists = await db.user.findFirst({
                where: {username}
            });
            if (userExists) {
                return badRequest({
                    fields,
                    formError: `User with username ${username} already exists`
                });
            }
            // create the user
            // create their session and redirect to /jokes
            return badRequest({
                fields,
                formError: "Not implemented"
            });
        }
        default: {
            return badRequest({
                fields,
                formError: `Login type invalid`
            });
        }
    }
};

export default function Login() {
    const actionData = useActionData<ActionData>();
    const [searchParams] = useSearchParams();

    const loginType = actionData?.fields?.loginType;

    const username = actionData?.fields?.username;
    const usernameFieldError = actionData?.fieldErrors?.username;

    const password = actionData?.fields?.password;
    const passwordFieldError = actionData?.fieldErrors?.password;

    return (
        <div className="container">
            <div className="content" data-light="">
                <h1>Login</h1>
                <Form method="post">
                    <input
                        type="hidden"
                        name="redirectTo"
                        value={searchParams.get("redirectTo") ?? undefined}
                    />
                    <fieldset>
                        <legend className="sr-only">
                            Login or Register?
                        </legend>
                        <label>
                            <input
                                type="radio"
                                name="loginType"
                                value="login"
                                defaultChecked={ !loginType || loginType === "login" }
                            />{" "}
                            Login
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="loginType"
                                value="register"
                                defaultChecked={ loginType === "register" }
                            />{" "}
                            Register
                        </label>
                    </fieldset>
                    <div>
                        <label htmlFor="username-input">Username</label>
                        <input
                            type="text"
                            id="username-input"
                            name="username"
                            defaultValue={username}
                            aria-invalid={Boolean(
                                usernameFieldError
                            )}
                            aria-errormessage={
                                usernameFieldError
                                    ? "username-error"
                                    : undefined
                            }
                        />
                        {usernameFieldError ? (
                            <p
                                className="form-validation-error"
                                role="alert"
                                id="username-error"
                            >
                                {usernameFieldError}
                            </p>
                        ) : null}
                    </div>
                    <div>
                        <label htmlFor="password-input">Password</label>
                        <input
                            id="password-input"
                            name="password"
                            defaultValue={password}
                            type="password"
                            aria-invalid={
                                Boolean(
                                    passwordFieldError
                                ) || undefined
                            }
                            aria-errormessage={
                                passwordFieldError
                                    ? "password-error"
                                    : undefined
                            }
                        />
                        {passwordFieldError ? (
                            <p
                                className="form-validation-error"
                                role="alert"
                                id="password-error"
                            >
                                {passwordFieldError}
                            </p>
                        ) : null}
                    </div>
                    <div id="form-error-message">
                        {actionData?.formError ? (
                            <p
                                className="form-validation-error"
                                role="alert"
                            >
                                {actionData.formError}
                            </p>
                        ) : null}
                    </div>
                    <button type="submit" className="button">
                        Submit
                    </button>
                </Form>
            </div>
            <div className="links">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/jokes">Jokes</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
