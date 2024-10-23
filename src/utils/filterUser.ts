export const filterUser=(user: any) => {
  return {firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    age: user.age,
    gender: user.gender,
    about: user.about,
    skills: user.skills,
    location: user.location}
};