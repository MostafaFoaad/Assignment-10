import sgMail from '@sendgrid/mail';
import { compareHash, generateDecryption, generateEncryption, generateHash } from "../../common/utils/index.js";
import { userModel, findOne, createOne } from "../../DB/index.js";
import { otpModel } from "../../DB/model/otp.model.js";
import { SENDGRID_API_KEY, SENDGRID_EMAIL_SENDER } from "../../../config/config.service.js";

sgMail.setApiKey(SENDGRID_API_KEY);

export const signup = async (inputs) => {
    const { username, email, password,phone } = inputs;

    const checkUserExist = await findOne({
        model: userModel,
        filter: { email },
    });

    if (checkUserExist) {
        throw new Error('EMAIL EXISTS', { cause: { status: 409 } });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await generateHash({ plainText: otp });

    await createOne({
        model: otpModel,
        data: { email, otp: hashedOtp }
    });

    const msg = {
        to: email,
        from: SENDGRID_EMAIL_SENDER,
        subject: 'Verification Code',
        html: `<h1>Welcome</h1><p>Your OTP is: <b>${otp}</b></p>`,
    };

    await sgMail.send(msg);

    const user = await createOne({
        model: userModel,
        data: { 
            username, 
            email, 
            password: await generateHash({ plainText: password }),
            phone:  await generateEncryption(phone)
        }
    });

    return user;
};

export const verifyEmail = async (inputs) => {
    const { email, otp } = inputs;

    const otpRecord = await findOne({ 
        model: otpModel, 
        filter: { email } 
    });

    if (!otpRecord) {
        throw new Error('OTP EXPIRED OR INVALID', { cause: { status: 400 } });
    }

    const isOtpValid = await compareHash({plainText:otp, cipherText:otpRecord.otp});
    if (!isOtpValid) {
        throw new Error('INVALID OTP', { cause: { status: 400 } });
    }

    await userModel.updateOne({ email }, { confirmEmail: new Date() });
    await otpModel.deleteOne({ _id: otpRecord._id });

    return { message: "Email verified successfully" };
};

export const login = async (inputs) => {
    const { email, password } = inputs;
    const user = await findOne({
        model: userModel,
        filter: { email },
        options: { lean: true }
    });

    if (!user) {
        throw new Error('USER CANNOT BE FOUND', { cause: { status: 404 } });
    }

    if (!await compareHash({plainText:password, cipherText:user.password})) {
        throw new Error('INVALID LOGIN DATA', { cause: { status: 404 } });
    }
    user.phone=await generateDecryption(user.phone);
    return user;
};