import Link from 'next/link';
import React from 'react';

type PostTagsProps = {
    tags: string[];
};

export default function PostTags({ tags }: PostTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

	return (
		<div className="post-tags mb-4">
			{tags.map((tag, index) => (
				<span key={index} className="mr-2 lnline-block">
					<Link 
						href={`/tags/${tag}`}
						className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
					>
						#{tag}
					</Link>
				</span>
			))}
		</div>
	);
}