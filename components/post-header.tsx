import PostDate from './post-date';
import PostTitle from './post-title';
type Props = {
  title: string;
  postDate: string;
  updateDate: string;
};

const PostHeader = ({ title, postDate, updateDate }: Props) => {
  return (
    <div className='py-16'>
      <PostTitle>{title}</PostTitle>
      <div className='mt-5 flex justify-center'>
        <PostDate postDate={postDate} updateDate={updateDate} />
      </div>
    </div>
  );
};

export default PostHeader;
