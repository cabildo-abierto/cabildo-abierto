import React from "react";
import {permanentRedirect, redirect} from "next/navigation";

export type PostProps = {
  id: string;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
      const authorName = post.author ? post.author.name : "Unknown author";
      return (
          <Link href={`/post/${post.id}`}>
              <div className="bg-white shadow-md rounded-lg p-4 mb-4 cursor-pointer">
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-2">Iniciada por: {authorName}</p>
                  <div className="text-gray-800">{post.content}</div>
              </div>
          </Link>
      );
};

export default Post;