import { useState } from "react";
function debounce(fn, wait) {
  let timer;
  return function (...thisArgs) {
    //  console.log('thisArgs', thisArgs);
    clearTimeout(timer);
    timer = setTimeout(function () {
      return fn.apply(this, thisArgs);
    }, wait);
  };
}

const debouceSearch = debounce((val) => {
  console.log(val);
}, 2000);
const Test1 = () => {
  const [value, setValue] = useState("");

  const handleOnSearch = (e) => {
    const val = e.currentTarget.value;
    setValue(val);
    debouceSearch(val);
  };

  // console.log('Value', value);

  return (
    <div className="size-screen p-4">
      <span>Search Bar</span>
      <input
        className="w-full h-10 bg-red-50 text-black"
        value={value}
        onChange={handleOnSearch}
        id="search"
      />
    </div>
  );
};

export default Test1;
