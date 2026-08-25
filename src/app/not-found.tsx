import Link from "next/link";

export default function NoEncontrado() {
  return (
    <section className="seccion">
      <div className="contenedor seccion__cabeza">
        <p className="eyebrow">Página no encontrada</p>
        <h1 className="seccion__titulo">Esta página no existe</h1>
        <p className="prosa" style={{ marginTop: "1rem" }}>
          Puede que el enlace haya cambiado. Desde el catálogo puedes ver todas las piezas
          disponibles.
        </p>
        <p style={{ marginTop: "2rem" }}>
          <Link className="boton boton--primario" href="/catalogo">
            Ver el catálogo
          </Link>
        </p>
      </div>
    </section>
  );
}
