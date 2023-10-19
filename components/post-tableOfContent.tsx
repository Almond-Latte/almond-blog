import type TableOfContent from '../interfaces/tableOfContent';
import styles from '../styles/tableOfContent-styles.module.css';
type Props = {
  tableOfContents: TableOfContent[];
};

const PostTableOfContent = ({ tableOfContents }: Props) => {
  return (
    <div className='hidden md:block w-72 ml-3'>
      <div className='flex flex-col sticky top-6'>
        <div className='p-4 shadow-md rounded-xl mb-6 bg-white'>
          <p className='text-xl text-bold mb-4'>目次</p>
          <ul className=''>
            {tableOfContents.map((TOC: TableOfContent) => {
              if (TOC.level === 'H2') {
                return (
                  <li className={styles.li_h2} key={TOC.href}>
                    <a href={TOC.href}>{TOC.title}</a>
                  </li>
                );
              } else {
                return (
                  <li className={styles.li_h3} key={TOC.href}>
                    <a href={TOC.href}>{TOC.title}</a>
                  </li>
                );
              }
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostTableOfContent;
