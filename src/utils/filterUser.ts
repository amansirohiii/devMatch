export const filterUser=(user: any) => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photoUrl: user.photoUrl,
    age: user.age,
    gender: user.gender,
    about: user.about,
    skills: user.skills,
    location: user.location}
};

export const USER_SAFE_DATA = "_id firstName lastName email photoUrl age gender about skills";