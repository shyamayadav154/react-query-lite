// import { useQuery } from "@tanstack/react-query";
import { useQuery } from "../utils/react-query-lite";
import axios from "axios";

const API_BASE_URL = "https://jsonplaceholder.typicode.com";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch all posts
const fetchPosts = async () => {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    return response.data.slice(0, 8);
};

// Fetch a single post by ID
const fetchPost = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
    return response.data;
};

// Hook to fetch all posts
export const usePosts = () => {
    return useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            await sleep(1000);
            return fetchPosts();
        },
        staleTime:5000,
        cacheTime:5000
    });
};

// Hook to fetch a single post
export const usePost = (id) => {
    return useQuery({
        queryKey: ["posts", id],
        queryFn: async () => {
            await sleep(1000);
            return fetchPost(id);
        },
        // enabled: !!id, // Only run the query if an ID is provided
        staleTime:3000
    });
};
