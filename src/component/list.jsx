import { Link } from "react-router-dom";
import { usePosts, usePost } from "../hooks/posts";
import { useState } from "react";

export const Home = () => {
    const [postId, setPostId] = useState(null);
    return (
        <main>
            <h1>React query lite</h1>
            {postId && <PostDetails id={postId} setPostId={setPostId} />}
            {!postId && <PostsList setPostId={setPostId} />}
            {/* <PostsList setPostId={setPostId} /> */}
        </main>
    );
};

export const PostsList = ({ setPostId }) => {
    const { data: posts, status, error, isFetching } = usePosts();
    console.log({ posts, status });

    const isLoading = status === "loading";
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (
        <div>
            <ul>
                {posts?.map((post) => (
                    <li key={post.id} onClick={() => setPostId(post.id)}>
                        {post.title}
                    </li>
                ))}
            </ul>
            {isFetching && <div style={{color:'green'}}>Background update...</div>}
        </div>
    );
};

export const PostDetails = ({ id,setPostId }) => {
    const { data: post, error, status, isFetching } = usePost(id);

    const isLoading = status === "loading";

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (
        <div>
            <button onClick={() => setPostId(null)}>Back</button>
            <h1>{post?.title}</h1>
            <p>{post?.body}</p>

            {isFetching && <div style={{color:'green'}}>Background update...</div>}
        </div>
    );
};

