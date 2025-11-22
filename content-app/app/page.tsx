import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, enter your query below.
          </h1>
          <input type = "text" placeholder = "Enter Your query" className="inputbox" required />
          <input type="submit" value="Submit" />
    </div>  
  );
}
