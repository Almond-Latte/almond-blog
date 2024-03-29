type Props = {
  content: string;
};

const PostBody = ({ content }: Props) => {
  return (
    <div className='content max-w-2xl mx-auto'>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PostBody;
