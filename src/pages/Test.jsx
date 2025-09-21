import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.handlers = [];

    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
    }
  }

  _runHandlers() {
    if (this.state === PENDING) return;
    this.handlers.forEach((handler) => {
      if (this.state === FULFILLED) {
        handler.onFulfilled(this.value);
      } else {
        handler.onRejected(this.value);
      }
    });
    this.handlers = [];
  }

  _resolve(value) {
    if (this.state !== PENDING) return;

    this.state = FULFILLED;
    this.value = value;
    this._runHandlers();
  }

  _reject(error) {
    if (this.state !== PENDING) return;
    this.state = REJECTED;
    this.value = error;
    this._runHandlers();
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.handlers.push({
        onFulfilled: (value) => {
          if (!onFulfilled) return resolve(value);
          try {
            resolve(onFulfilled(value));
          } catch (error) {
            reject(error);
          }
        },
        onRejected: (error) => {
          if (!onRejected) return reject(error);
          try {
            reject(onRejected(error));
          } catch (error) {
            reject(error);
          }
        },
      });

      this._runHandlers();
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      (value) => {
        callback();
        return value;
      },
      (error) => {
        callback();
        throw error;
      }
    );
  }
}

(() => {
  const timers = new Map();

  function checkOnIdle() {
    for (let [id, timeout] of timers) {
      const { endTime, cb } = timeout;
      if (Date.now() > endTime) {
        cb();
        myClearTimeout(id);
      }
    }

    requestIdleCallback(checkOnIdle);
  }

  window.mySetTimeout = function (cb, delay) {
    const startTime = Date.now();
    const id = startTime;
    timers.set(id, {
      cb,
      endTime: startTime + delay,
    });

    return id;
  };

  window.myClearTimeout = function (id) {
    if (timers.has(id)) {
      timers.delete(id);
    }
  };

  checkOnIdle();
})();

(() => {
  const intervals = new Set();

  window.mySetInterval = function (cb, delay) {
    const id = Date.now();
    intervals.add(id);

    function _interval() {
      setTimeout(() => {
        if (intervals.has(id)) {
          cb();
          _interval();
        }
      }, delay);
    }

    _interval();
    return id;
  };

  window.myClearInterval = function (id) {
    intervals.delete(id);
  };
})();

function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

function throttle(fn, wait) {
  let timer = 0;
  return function (...args) {
    const now = Date.now();
    if (now - timer > wait) {
      fn.apply(this, args);
      timer = now;
    }
  };
}

const handleSearch = throttle((query) => {
  console.log("Fetching results for:", query);
}, 500);

const accordianData = [
  {
    title: "Accordian 1 title",
    description:
      "Accordian 1 description description description description description description description description",
  },
  {
    title: "Accordian 2 title",
    description:
      "Accordian 2 description description description description description description description description description",
  },
  {
    title: "Accordian 3 title",
    description:
      "Accordian 3 description description description description description description description description description",
  },
  {
    title: "Accordian 4 title",
    description:
      "Accordian 4 description description description description description description description description description",
  },
  {
    title: "Accordian 5 title",
    description:
      "Accordian 5 description description description description description description description description description",
  },
];

const Test = () => {
  const arr = [1, 2, 3, 4];
  const [accordianIdx, setAccordianIdx] = useState(-1);

  const arr2 = arr.map((v, idx, arr) => {
    return v + idx;
  });
  Array.prototype.myMap = function (cb, thisArgs) {
    if (typeof cb !== "function") {
      throw "Not a function";
    }
    console.log(thisArgs);
    const length = this.length;
    const res = [];
    for (let i = 0; i < length; i++) {
      res.push(cb.call(thisArgs, this[i], i, this));
    }
    return res;
  };
  Array.prototype.myFilter = function (cb, thisArgs) {
    const length = this.length;
    const arr = [];
    for (let i = 0; i < length; i++) {
      if (cb.call(this[i], i, this)) {
        arr.push(this[i]);
      }
    }
    return arr;
  };

  Array.prototype.myFind = function (fn, thisArgs) {
    const length = this.length;
    for (let i = 0; i < length; i++) {
      if (fn(this[i], i, this)) {
        return this[i];
      }
    }
    return undefined;
  };

  Array.prototype.myReduce = function (fn, thisArgs) {
    const length = this.length;
    let result = this[0];
    for (let i = 1; i < length; i++) {
      result = fn(result, this[i], i, this);
    }
    return result;
  };

  Array.prototype.myBind = function (ctx, ...args) {
    const fn = this;
    return function () {
      return fn.call(ctx, ...args);
    };
  };

  const arr3 = arr.myMap((v, idx, arr) => v + idx);
  const arr4 = arr.myFilter((v, i, a) => {
    return v % 2 === 0;
  });
  const arr5 = arr.myFind((v) => v % 2 === 1);

  console.log(arr2, arr3, arr4, arr5);
  console.log(
    arr.reduce((acc, v, idx, arr) => {
      return acc + v;
    })
  );
  console.log(
    [].myReduce((acc, v, idx, arr) => {
      return acc + v;
    })
  );

  useEffect(() => {}, []);

  return (
    <div className="flex flex-col w-full">
      {accordianData.map((val, idx) => {
        return (
          <div className="flex flex-col" key={idx}>
            <div
              className="flex flex-row gap-1"
              onClick={() =>
                setAccordianIdx((cur) => {
                  if (cur === idx) return -1;
                  else return idx;
                })
              }
            >
              <span>{val?.title}</span>
              {idx === accordianIdx ? <ChevronUp /> : <ChevronDown />}
            </div>
            {accordianIdx === idx && (
              <div>
                <span>{val.description}</span>
              </div>
            )}
          </div>
        );
      })}
      <Carousel />
    </div>
  );
};

export default Test;

const Carousel = () => {
  const slides = [
      "https://picsum.photos/1200/600?1",
      "https://picsum.photos/1200/600?2",
      "https://picsum.photos/1200/600?3",
    ],
    interval = 3000; // autoplay interval (ms)
  const trackRef = useRef(null);
  const autoplayRef = useRef(null);

  // start at 1 because extendedSlides = [last, ...slides, first]
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);

  const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

  // compute slide width (first slide's bounding width) — responsive
  const updateWidth = useCallback(() => {
    const first = trackRef.current?.children?.[0];
    if (first) {
      const w = Math.round(first.getBoundingClientRect().width);
      if (w && w !== slideWidth) setSlideWidth(w);
    }
  }, [slideWidth]);

  // compute initially and on resize
  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // apply transform + transition whenever index/width/transition change
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slideWidth === 0) return;
    track.style.transition = transitionEnabled
      ? "transform 500ms ease"
      : "none";
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }, [currentIndex, transitionEnabled, slideWidth]);

  // handle the clones: when we finish transition onto a clone, jump (no transition) to real slide
  const handleTransitionEnd = useCallback(() => {
    const lastIndex = extendedSlides.length - 1; // index of last clone
    if (currentIndex === lastIndex) {
      // moved to clone of first slide -> jump to real first
      setTransitionEnabled(false);
      setCurrentIndex(1);
      // re-enable transition on next frame (ensures instant jump)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setTransitionEnabled(true))
      );
    } else if (currentIndex === 0) {
      // moved to clone of last slide -> jump to real last
      setTransitionEnabled(false);
      setCurrentIndex(extendedSlides.length - 2); // real last index
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setTransitionEnabled(true))
      );
    }
  }, [currentIndex, extendedSlides.length]);

  // autoplay helpers
  const clearAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };
  const startAutoplay = useCallback(() => {
    clearAutoplay();
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((p) => p + 1);
      setTransitionEnabled(true);
    }, interval);
  }, [interval]);

  // start autoplay on mount
  useEffect(() => {
    startAutoplay();
    return () => clearAutoplay();
  }, [startAutoplay]);

  // pause/resume on hover
  const handleMouseEnter = () => clearAutoplay();
  const handleMouseLeave = () => startAutoplay();

  // nav controls (also restart autoplay so user doesn't get immediate jump)
  const next = () => {
    setCurrentIndex((p) => p + 1);
    setTransitionEnabled(true);
    startAutoplay();
  };
  const prev = () => {
    setCurrentIndex((p) => p - 1);
    setTransitionEnabled(true);
    startAutoplay();
  };

  // ensure we recalc width once images load (in case images change layout)
  const onImgLoad = () => updateWidth();

  return (
    <div
      className="relative w-full max-w-3xl mx-auto overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Prev */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white text-2xl p-2 rounded-full hover:bg-black/60 transition"
      >
        ‹
      </button>

      {/* Track container */}
      <div className="overflow-hidden">
        <ul
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex"
          style={{ width: `${extendedSlides.length * 100}%` }} // not required but harmless
        >
          {extendedSlides.map((src, idx) => (
            <li key={idx} className="min-w-full flex-shrink-0">
              <img
                src={src}
                alt={`slide-${idx}`}
                onLoad={onImgLoad}
                className="w-full h-64 md:h-80 object-cover"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Next */}
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white text-2xl p-2 rounded-full hover:bg-black/60 transition"
      >
        ›
      </button>

      {/* Dots (optional but helpful) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 z-20">
        {slides.map((_, i) => {
          // map real slides: index 1..slides.length -> dot 0..slides.length-1
          // compute active: currentIndex 1..n -> activeIndex = currentIndex-1, but adjust when clone-jumped
          const activeIndex =
            (((currentIndex - 1) % slides.length) + slides.length) %
            slides.length;
          return (
            <button
              key={i}
              onClick={() => {
                // jump to corresponding real index
                setCurrentIndex(i + 1);
                setTransitionEnabled(true);
                startAutoplay();
              }}
              className={`w-2 h-2 rounded-full ${
                activeIndex === i ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

// const theme = React.createContext("light");


Promise.resolve().then(() => console.log(1));
setTimeout(() => console.log(2), 10);
queueMicrotask(() => {
    console.log(3);
    queueMicrotask(() => console.log(4));
});
console.log(5);
5
1
3
4
2