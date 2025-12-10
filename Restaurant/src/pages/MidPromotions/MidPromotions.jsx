import React from 'react';

const promotions = [
  {
    title: "UP TO 50% OFF",
    description: "OFFERS TO BRIGHTEN YOUR DAY",
    image: "🔥",
  },
  {
    title: "YOUR FAVOURITE",
    description: "FOOD FROM NEW RESTAURANTS!",
    image: "🍜",
  },
  {
    title: "TRY NOW",
    description: "EXPRESS DELIVERY NEAR YOU!",
    image: "🚀",
  },
  {
    title: "TOP PICKS!",
    description: "HIGHEST RATED EATERIES!",
    image: "🌟",
  },
];

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '20px',
    position: 'relative',
  },
  promotions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    maxWidth: '900px',
  },
  card: {
    backgroundColor: 'white',
    width: '200px',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  desc: {
    fontSize: '14px',
    color: '#555',
  },
  adsBannerLeft: {
    position: 'fixed',
    left: '0',
    top: '100px',
    zIndex: '10',
    width: '200px',
  },
  adsBannerRight: {
    position: 'fixed',
    right: '0',
    top: '100px',
    zIndex: '10',
    width: '200px',
  },
  bannerImg: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
};

const MidPromotions = () => {
  return (
    <>
      {/* Banner bên trái */}
      <div style={styles.adsBannerLeft}>
        <a href="Link quảng cáo bên trái" target="_blank">
          <img
            src="Ảnh quảng cáo bên trái"
            alt="Banner Left"
            style={styles.bannerImg}
          />
        </a>
      </div>

      {/* Banner bên phải */}
      <div style={styles.adsBannerRight}>
        <a href="Link quảng cáo bên phải" target="_blank">
          <img
            src="Ảnh quảng cáo bên phải"
            alt="Banner Right"
            style={styles.bannerImg}
          />
        </a>
      </div>

      {/* Nội dung chính */}
      <div style={styles.wrapper}>
        <div style={styles.promotions}>
          {promotions.map((item, index) => (
            <div
              key={index}
              style={styles.card}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={styles.icon}>{item.image}</div>
              <h4 style={styles.title}>{item.title}</h4>
              <p style={styles.desc}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MidPromotions;
