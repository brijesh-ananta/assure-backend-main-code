/* eslint-disable react/prop-types */
import axiosToken from "../../../utils/axiosToken";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function StopFulFillment({
  requestInfoData,
  isCompleted,
  fetchData
}) {
  const initialValues = {
    comment: requestInfoData?.stopFulfillmentComment || ''
  };

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .trim()
      .required("Comment is required")
      .test(
        "not-empty",
        "Comment cannot be only spaces",
        (val) => val.trim().length > 0
      ),
  });

  const handleSubmit = async (values, { resetForm }) => {
    const cleanedComment = values.comment.trim();

    const finalPayload = {
      column: "stopFulfillment",
      submitData: {
        status: "completed",
        comment: cleanedComment
      },
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        finalPayload
      );

      toast.success("Fulfillment stopped");
      resetForm();
      fetchData()
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />

      <div className="container">
        <p className="blue-heading text-center">Stop Fulfillment</p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="request-form form-field-wrapper">
              <div className="d-flex gap-3">
                <label className="font no-wrap">TC SME Comment</label>
                <div className="w-100">
                  <Field
                    as="textarea"
                    name="comment"
                    placeholder="Comment is mandatory for stopping fulfillment"
                    className="form-control formcontrol mb-1"
                    rows={5}
                    disabled={isCompleted}
                  />
                  <div className="text-danger font">
                    <ErrorMessage name="comment" />
                  </div>
                </div>
              </div>

              <div className="d-flex gap-5 justify-content-end mt-5">
                <button disabled={isCompleted} type="button" className="btn cancel-btn">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save-btn"
                  disabled={isCompleted || isSubmitting}
                >
                  Stop Fulfillment
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default StopFulFillment;
