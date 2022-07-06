import { Link, Form } from "@remix-run/react";
import type { Joke } from "@prisma/client";

type JokeDisplayProps = {
    joke: Pick<Joke, "content" | "name">;
    isOwner: boolean;
    canDelete?: boolean;
};

export function JokeDisplay({ joke, isOwner, canDelete = true }: JokeDisplayProps) {
    return (
        <div>
            <p>Here's your hilarious joke:</p>
            <p>{joke.content}</p>
            <Link to=".">{joke.name} Permalink</Link>
            {isOwner ? (
                <Form method="post">
                    <input
                        type="hidden"
                        name="_method"
                        value="delete"
                    />
                    <button
                        type="submit"
                        className="button"
                        disabled={!canDelete}
                    >
                        Delete
                    </button>
                </Form>
            ) : null}
        </div>
    );
}
