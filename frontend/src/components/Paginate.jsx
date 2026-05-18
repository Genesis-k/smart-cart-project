import React from 'react';
import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '', sectionName = '' }) => {
  return (
    pages > 1 && (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '5px' }}>
        {[...Array(pages).keys()].map((x) => (
          <Link
            key={x + 1}
            to={
              !isAdmin
                ? sectionName
                  ? `/section/${sectionName}/page/${x + 1}`
                  : keyword
                  ? `/search/${keyword}/page/${x + 1}`
                  : `/page/${x + 1}`
                : `/admin/productlist/${x + 1}`
            }
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              background: x + 1 === page ? '#333' : '#fff',
              color: x + 1 === page ? '#fff' : '#333',
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            {x + 1}
          </Link>
        ))}
      </div>
    )
  );
};

export default Paginate;