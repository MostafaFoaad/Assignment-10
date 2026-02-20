import mongoose from "mongoose";
import { genderEnum, providerEnum } from "../../common/enums/index.js";

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:[2,'minlength cannot be less than 2 chars'],
        maxLength:[25,'maxlength cannot be more than 25 chars'],
        trim:true,
    },

    lastName:{
        type:String,
        required:true,
        minLength:[2,'minlength cannot be less than 2 chars'],
        maxLength:[25,'maxlength cannot be more than 25 chars'],
        trim:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
    },

    password:{
        type:String,
        required:true,
    },

    phone:{type:String},

    confirmEmail:Date,
    
    gender:{type:Number,enum:Object.values(genderEnum),default:genderEnum.Male},

    provider:{type:Number,enum:Object.values(providerEnum),default:providerEnum.System},

    profilePicture:String,

    coverProfilePictures:{String},



},{
    collection:'Route_Users',
    timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    autoIndex:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

userSchema.virtual('username').set(function(value){
    const [firstName,lastName]=value?.split(' ')||[];
    this.set({firstName,lastName});
}).get(function(){
    return this.firstName + ' ' + this.lastName;
})

export const userModel=mongoose.models.User||mongoose.model('User',userSchema);