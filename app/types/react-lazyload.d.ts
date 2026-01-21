declare module 'react-lazyload' {
  import * as React from 'react';
  
  interface LazyLoadProps {
    height?: number | string;
    once?: boolean;
    offset?: number | number[];
    overflow?: boolean;
    resize?: boolean;
    scroll?: boolean;
    children?: React.ReactNode;
    throttle?: number | boolean;
    debounce?: number | boolean;
    placeholder?: React.ReactNode;
    scrollContainer?: string | Element;
    unmountIfInvisible?: boolean;
    preventLoading?: boolean;
  }
  
  export default function LazyLoad(props: LazyLoadProps): JSX.Element;
}