// app/tags/[tag]/page.tsx
import Container from 'components/container';
import Layout from 'components/SectionLayout';
import { getAllPosts } from 'lib/api';
import Post from 'types/post';
import { notFound } from "next/navigation";
import PostPreview from "components/post-preview";
import { generateTagsFromPosts, type Tag } from "@/lib/generateTags";

export async function generateStaticParams() {
  const allPosts: Post[] = await getAllPosts(["tags"]);
  const tags: Tag[] = generateTagsFromPosts(allPosts);
  return tags.map((tag) => ({ tag: tag.path }));
}

export default async function TaggedPosts(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  const tagPath = decodeURIComponent(params.tag);
  const allPosts: Post[] = await getAllPosts(["tags"]);

  const tags: Tag[] = generateTagsFromPosts(allPosts);
  const tag: Tag | undefined = tags.find(
    (t) => t.path.toLowerCase() === tagPath.toLowerCase()
  );

  if (!tag) {
    notFound();
  }

  const taggedPosts = allPosts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tagPath.toLowerCase())
  );



  return (
    <Layout>
      <Container>
        <h2 className="m-24 text-3xl font-bold text-gray-800 text-center">
          Posts tagged with <span className="text-amber-600"># {tag.name}</span>
        </h2>
        <div className="divide-y divide-gray-200">
          {taggedPosts.map((post) => (
            <PostPreview
              key={post.slug}
              title={post.title}
              postDate={post.postDate}
              coverImage={post.coverImage}
              lastmod={post.lastmod}
              slug={post.slug}
              excerpt={post.excerpt}
            />
          ))}
        </div>
      </Container>
    </Layout>
  );
}
