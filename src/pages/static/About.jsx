import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";

function About() {
  const [headerTitle] = useState("About Us");

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Main Content */}
      <section>
        <div className="notification">
          <div className="container my-4">
            <div className="row row-cols-1 row-cols-lg-2 gy-3">
              <div className="col">
                <div className="card shadow">
                  <div className="card-body">
                    <h2>About Our Company</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Praesent consequat fermentum odio, at consectetur arcu
                      fermentum at. Pellentesque habitant morbi tristique
                      senectus et netus et malesuada fames ac turpis egestas.
                    </p>
                    <p>
                      Donec condimentum, neque et dignissim ultrices, elit
                      sapien aliquet arcu, in consequat nulla ligula vitae
                      justo. Fusce dapibus, velit at ultricies convallis, lacus
                      ipsum sollicitudin leo, a porta elit mauris et quam.
                    </p>
                    <p>
                      Quisque vehicula quam in metus fermentum, in tempor nibh
                      consequat. Etiam ac purus ut odio malesuada hendrerit in
                      ac risus. Sed id eros vitae justo luctus convallis.
                    </p>
                    <p>
                      For more information, feel free to{" "}
                      <Link to="/contact">contact us</Link>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card shadow">
                  <div className="card-body">
                    <h2>Our Mission</h2>
                    <p>
                      Our mission is to deliver high-quality products and
                      exceptional customer service. We strive to innovate and
                      lead the industry with passion and integrity.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Ut ullamcorper, arcu in efficitur placerat, urna libero
                      mollis nisl, sit amet feugiat urna leo nec nisi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default About;
