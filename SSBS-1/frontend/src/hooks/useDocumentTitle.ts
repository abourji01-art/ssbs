import { useEffect } from 'react';

/**
 * Sets the document title. Resets to default on unmount.
 */
const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
};

export default useDocumentTitle;
