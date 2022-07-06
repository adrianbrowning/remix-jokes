import type {LoaderFunction} from "@remix-run/node";
import { useCatch, Link, useLoaderData } from "@remix-run/react";
import {json} from "@remix-run/node";
import type {Joke} from "@prisma/client";

import {db} from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
    const count = await db.joke.count();
    const randomRowNumber = Math.floor(Math.random() * count);
    const [randomJoke] = await db.joke.findMany({
        take: 1,
        skip: randomRowNumber,
    });
    if (!randomJoke) throw new Response(`No random joke found`, {status: 404});

    return json(randomJoke);
};

export default function JokesIndexRoute() {
    const joke = useLoaderData<Joke>();
    return (
        <div>
            <p>Here's a random joke:</p>
            <p>{joke.content}</p>
            <Link to={joke.id}>"{joke.name}" Permalink</Link>
        </div>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    if (caught.status !== 404) throw new Error( `Unexpected caught response with status: ${caught.status}`);

    return (
        <section className="error-container">There are no jokes to display.</section>
    );
}

export function ErrorBoundary() {
    return (
        <div className="error-container">
            I did a whoopsies.
        </div>
    );
}
