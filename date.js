exports.getDate = getDate;

function getDate(){
  const today = new Date();
  const currDay = today.getDay()

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };

  const day = today.toLocaleDateString("en-US", options);
  return day;
}
