"use client";
import { useState } from "react";
import ChapterAuthorInput from "./ChapterAuthorInput";

interface Props {
  onSubmit: (data: any) => void;
}

const ChapterInput = ({ onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [abstract, setAbstract] = useState("");
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [authors, setAuthors] = useState([""]);

  const addAuthor = () => setAuthors([...authors, ""]);
  const removeAuthor = (i: number) => setAuthors(authors.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, val: string) => setAuthors(authors.map((a, idx) => (idx === i ? val : a)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, link, abstract, firstPage, lastPage, authors });
  };

  return (
    <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
      <div className="col-span-2">
        <label>Título do capítulo:</label>
        <input className="border p-1 w-full" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="col-span-2">
        <label>Link:</label>
        <input className="border p-1 w-full" value={link} onChange={e => setLink(e.target.value)} required />
      </div>
      <div className="col-span-2">
        <label>Abstract:</label>
        <textarea className="border p-1 w-full" rows={4} value={abstract} onChange={e => setAbstract(e.target.value)} />
      </div>
      <div>
        <label>Primeira página:</label>
        <input type="number" className="border p-1 w-full" value={firstPage} onChange={e => setFirstPage(Number(e.target.value))} required />
      </div>
      <div>
        <label>Última página:</label>
        <input type="number" className="border p-1 w-full" value={lastPage} onChange={e => setLastPage(Number(e.target.value))} required />
      </div>

      <div className="col-span-2">
        <h3>Autores:</h3>
        {authors.map((a, i) => (
          <ChapterAuthorInput key={i} value={a} onChange={val => updateAuthor(i, val)} onRemove={() => removeAuthor(i)} />
        ))}
        <button type="button" className="bg-blue-500 text-white px-2 mt-2" onClick={addAuthor}>+ Adicionar autor</button>
      </div>

      <div className="col-span-2">
        <button type="submit" className="bg-green-500 text-white px-3 py-1 mt-3">Salvar capítulo</button>
      </div>
    </form>
  );
};

export default ChapterInput;
