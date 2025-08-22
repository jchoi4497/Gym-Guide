import classNames from 'classnames';

function Panel({ children, className, ...rest }) {
    const finalClassNames = classNames("border rounded p-2 shadow bg-sky-50 w-full",
        className
    );

    return <div {...rest} className={finalClassNames}>{children}</div>;
}

export default Panel;