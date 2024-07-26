import React from 'react';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {

  const components: Components = {
    a: (props) => {
        const {children, href, ...rest} = props
        if(!href){
            return <a {...rest}>{children}</a>
        } else {
            return <Link href={href}>{children}</Link>
        }
    },
  };

  return (
    <div className="ck-content">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
