import React, {useState} from "react";
import axios from 'axios';
import {useForm} from "react-hook-form";
import styles from "./style/index.css"
import { ReactComponent as QuoraIcon } from './style/quora-icon.svg';

function App() {

  const API_URL = 'https://ide-server-stage.stage.atad.ml/v1';
  const [isUploaded, setIsUploaded] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {register, handleSubmit, formState: { errors }} = useForm()

  const [transformationId, setTransformationId] = useState(null)

  const {register: emailForm, handleSubmit: submitEmail, formState: {errors: emailErrors}} = useForm()
  const [isEmailSent, setIsEmailSent] = useState(false)

  const sendFile = async (data) => {
    if (data.file[0] && data.file[0].size > (15 * 1000 * 1000)) {
      setNetworkError('Maximum file size 15Mb')
      return
    }

    setIsLoading(true)
    const formData = new FormData();
    formData.append('file', data.file[0]);

    axios.post(`${API_URL}/file/upload-archive`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((res) => {
      setIsUploaded(true)
      setIsLoading(false)
      setTransformationId(res.data.transformationId)
    }).catch((err) => {
      setNetworkError(err.message)
      setIsLoading(false)
    });
  }

  const sendEmail = async (data) => {
    setIsLoading(true)
    axios.patch(`${API_URL}/file/set-email`, { transformationId, email: data.email })
        .then((res) => {
          setIsEmailSent(true)
          setIsLoading(false)
        }).catch((err) => {
          setNetworkError(err.message)
          setIsLoading(false)
        })
  }

  return (
      <div className="flex flex-col bg-gradient-to-b from-[#4c2a85] to-[#202d54] text-white">
        <div className="flex flex-col items-center py-20 px-4 min-h-screen">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            LookML to DBT Transformer
          </h1>
          <p className="text-base sm:text-lg mb-6">
            Transform your LookML git-based projects into DBT style code
            seamlessly.
          </p>
          {isUploaded ?
             <>
                {isEmailSent ?
                <>
                  <span className="text-notification">Thank you! We will contact you within 24 hours.</span>
                </>
                :
                <>
                  <form className="hook-form" onSubmit={submitEmail(sendEmail)}>
                    <span className="text-notification">The files are being processed, enter your email and we will contact you when it is complete.</span>
                    <input
                        placeholder="Enter your email"
                        className="input-field bg-white text-[#202d54] font-roboto p-2 rounded-lg"
                        {...emailForm("email", {
                          required: {
                            value: true,
                            message: "Please enter your email address",
                          },
                          pattern: {
                            value:
                                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                            message: "Invalid email address",
                          },
                        })}
                    />
                    {(emailErrors?.email?.type === "required" || emailErrors?.email?.type === 'pattern') && <span className="error">{emailErrors?.email?.message}</span>}
                    {isLoading ?
                        <div className="mt-5 flex justify-center" role="status">
                          <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-600"
                               viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                        :
                        <button type="submit" className="submit-button px-6 py-2 text-sm sm:text-base font-semibold bg-white text-[#202d54] rounded-full hover:bg-[#f5f5f5] transition-colors">
                          Send email
                        </button>
                    }
                    <span className="error">{networkError}</span>
                  </form>
                </>
                }
            </>
              :
              <form className="hook-form" onSubmit={handleSubmit(sendFile)}>
                <input
                    type="file"
                    className="input-file bg-white text-[#202d54] font-roboto p-2 rounded-lg"
                    accept=".zip"
                    name="projectFile"
                    {...register('file', {
                      required: {
                        value: true,
                        message: "Please select .zip archive",
                      },
                    })}
                />
                {errors?.file?.type === "required" && <span className="error">{errors?.file?.message}</span>}

                {isLoading ?
                    <div className="mt-10 flex justify-center" role="status">
                      <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-600"
                           viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"/>
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"/>
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                    :
                    <button type="submit" className="submit-button px-6 py-2 text-sm sm:text-base font-semibold bg-white text-[#202d54] rounded-full hover:bg-[#f5f5f5] transition-colors">
                      Upload Project
                    </button>
                }
                <span className="error">{networkError}</span>
              </form>
          }
          <div className="flex flex-col items-center mt-10">
            {!isUploaded && <p className="mb-4 text-center font-roboto">
              Instructions: Export your LookML project as a zip archive from
              GitHub and upload the file here.
            </p>}
            <a href="https://atad.ml" className="underline text-[#00BFFF]">
              Go to main page
            </a>
          </div>
          <footer className="flex justify-center items-center space-x-4 mt-10">
            <a
                href="https://www.linkedin.com/company/atadml"
                aria-label="LinkedIn"
                className="linkedin-icon w-8 h-8 flex items-center justify-center bg-white text-[#0077b5] rounded-full"
            >
              <i className="fab fa-linkedin">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="linkedin-svg"
                    fill="white"
                    viewBox="0 0 24 24">
                  <path
                      d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
              </i>
            </a>
            <a
                href="https://2023dlaunch.quora.com/"
                aria-label="Quora"
                className="w-8 h-8 flex items-center justify-center bg-white text-[#B92B27] rounded-full"
            >
              <i className="fab fa-quora">
                <QuoraIcon className="quora-svg" />
              </i>
            </a>
          </footer>
        </div>
      </div>
  );
}

export default App;
