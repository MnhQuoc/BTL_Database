import './Team.css';
import { FaFacebook } from 'react-icons/fa';
import {
  FaSquareGooglePlus,
  FaSquareInstagram,
  FaSquareXTwitter,
} from 'react-icons/fa6';

const Team = () => {
  return (
    <section id="team">
      <div className="container">
        <h6 className="section-subtitle text-center">Great Team</h6>
        <h3 className="section-title mb-5 text-center">Talented Chefs</h3>
        <div className="row">
          <div className="col-md-3 my-4">
            <div className="team-wrapper text-center">
              <img
                src="/images/avtquoc.jpg"
                className="circle-120 rounded-circle mb-3 shadow"
                alt="Quoc"
              />
              <h5 className="my-3">Quốc</h5>
              <p>Thư ký</p>
              <h6 className="socials mt-3">
                <a href="#" className="px-2">
                  <FaFacebook />
                </a>
                <a href="#" className="px-2">
                  <FaSquareXTwitter />
                </a>
                <a href="#" className="px-2">
                  <FaSquareInstagram />
                </a>
                <a href="#" className="px-2">
                  <FaSquareGooglePlus />
                </a>
              </h6>
            </div>
          </div>
          <div className="col-md-3 my-4">
            <div className="team-wrapper text-center">
              <img
                src="/images/avtthinh.jpg"
                className="circle-120 rounded-circle mb-3 shadow"
                alt="Thinh"
              />
              <h5 className="my-3">Thịnh</h5>
              <p>thành viên</p>
              <h6 className="socials mt-3">
                <a href="#" className="px-2">
                  <FaFacebook />
                </a>
                <a href="#" className="px-2">
                  <FaSquareXTwitter />
                </a>
                <a href="#" className="px-2">
                  <FaSquareInstagram />
                </a>
                <a href="#" className="px-2">
                  <FaSquareGooglePlus />
                </a>
              </h6>
            </div>
          </div>
          <div className="col-md-3 my-4">
            <div className="team-wrapper text-center">
              <img
                src="/images/avttuan.jpg"
                className="circle-120 rounded-circle mb-3 shadow"
                alt="Tuan"
              />
              <h5 className="my-3">Tuấn</h5>
              <p>thành viên</p>
              <h6 className="socials mt-3">
                <a href="#" className="px-2">
                  <FaFacebook />
                </a>
                <a href="#" className="px-2">
                  <FaSquareXTwitter />
                </a>
                <a href="#" className="px-2">
                  <FaSquareInstagram />
                </a>
                <a href="#" className="px-2">
                  <FaSquareGooglePlus />
                </a>
              </h6>
            </div>
          </div>
          <div className="col-md-3 my-4">
            <div className="team-wrapper text-center">
              <img
                src="/images/avtphuc.jpg"
                className="circle-120 rounded-circle mb-3 shadow"
                alt="Phuc"
              />
              <h5 className="my-3">Phúc</h5>
              <p>nhóm trưởng</p>
              <h6 className="socials mt-3">
                <a href="#" className="px-2">
                  <FaFacebook />
                </a>
                <a href="#" className="px-2">
                  <FaSquareXTwitter />
                </a>
                <a href="#" className="px-2">
                  <FaSquareInstagram />
                </a>
                <a href="#" className="px-2">
                  <FaSquareGooglePlus />
                </a>
              </h6>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
