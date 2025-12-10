import React from 'react';
import { Container } from 'react-bootstrap';
import MidPromotions from '../MidPromotions/MidPromotions';

const Promotions = () => {
  return (
    <Container className="mt-5 mb-5">
      <div className="text-center mb-4">
        <h1 className="display-4 mb-3">🎉 Khuyến Mãi Đặc Biệt</h1>
        <p className="lead text-muted">
          Khám phá các ưu đãi hấp dẫn dành cho bạn
        </p>
      </div>
      <MidPromotions />
    </Container>
  );
};

export default Promotions;

