import type TableOfContent from '../interfaces/tableOfContent';
import styles from '../styles/tableOfContent-styles.module.css';
type Props = {
  tableOfContents: TableOfContent[];
};

const PostTableOfContent = ({ tableOfContents }: Props) => {
  return (
    <div className='hidden lg:block w-80 ml-6'>
      <div className='flex flex-col sticky top-6'>
        <div className='p-4 shadow-md rounded-xl mb-6 bg-white'>
          <p className='text-lg font-bold'>目次</p>
          <ul>
            {tableOfContents.map((TOC: TableOfContent) => {
              if (TOC.level === 'H2') {
                return (
                  <li className={`toc ${styles.li_h2} ${styles.toc}`} key={TOC.href}>
                    <a className={styles.href_h3} href={TOC.href}>
                      {TOC.title}
                    </a>
                  </li>
                );
              } else {
                return (
                  <li className={`toc ${styles.toc} ${styles.li_h3}`} key={TOC.href}>
                    <a className={styles.href_h3} href={TOC.href}>
                      {TOC.title}
                    </a>
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
