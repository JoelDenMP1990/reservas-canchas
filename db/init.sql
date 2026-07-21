--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.canchas DROP CONSTRAINT IF EXISTS "FK_fbe00cacb073eb48c42346220b0";
ALTER TABLE IF EXISTS ONLY public.reservas DROP CONSTRAINT IF EXISTS "FK_8ee0c58de71f30301e1b6994695";
ALTER TABLE IF EXISTS ONLY public.pagos DROP CONSTRAINT IF EXISTS "FK_6dfdd0be04377c89116537cc6b9";
ALTER TABLE IF EXISTS ONLY public.reservas DROP CONSTRAINT IF EXISTS "FK_5ef21c9dc6a04f2128d062b7a25";
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS "UQ_3cd5652ab34ca1a0a2c7a255313";
ALTER TABLE IF EXISTS ONLY public.pagos DROP CONSTRAINT IF EXISTS "REL_6dfdd0be04377c89116537cc6b";
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS "PK_d76bf3571d906e4e86470482c08";
ALTER TABLE IF EXISTS ONLY public.canchas DROP CONSTRAINT IF EXISTS "PK_b0895a3e86f4558816d42e8b1d1";
ALTER TABLE IF EXISTS ONLY public.administradores DROP CONSTRAINT IF EXISTS "PK_6956c0b545649bba08e4099c81a";
ALTER TABLE IF EXISTS ONLY public.pagos DROP CONSTRAINT IF EXISTS "PK_37321ca70a2ed50885dc205beb2";
ALTER TABLE IF EXISTS ONLY public.reservas DROP CONSTRAINT IF EXISTS "PK_309c659053bcf5e56f8e40a2b42";
DROP TABLE IF EXISTS public.reservas;
DROP TABLE IF EXISTS public.pagos;
DROP TABLE IF EXISTS public.clientes;
DROP TABLE IF EXISTS public.canchas;
DROP TABLE IF EXISTS public.administradores;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administradores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administradores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying NOT NULL,
    "areaAsignada" character varying NOT NULL
);


--
-- Name: canchas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.canchas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying NOT NULL,
    tipo character varying NOT NULL,
    "tarifaBasePorHora" numeric(10,2) NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    "horaAperturaDesde" time without time zone NOT NULL,
    "horaCierreHasta" time without time zone NOT NULL,
    "administradorId" uuid
);


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying NOT NULL,
    email character varying NOT NULL,
    telefono character varying
);


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    monto numeric(10,2) NOT NULL,
    "metodoPago" character varying NOT NULL,
    "procesadoEn" timestamp without time zone,
    "reservaId" uuid
);


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    estado character varying DEFAULT 'PENDIENTE'::character varying NOT NULL,
    "horaInicio" timestamp without time zone NOT NULL,
    "horaFin" timestamp without time zone NOT NULL,
    "creadaEn" timestamp without time zone DEFAULT now() NOT NULL,
    monto numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "clienteId" uuid,
    "canchaId" uuid
);


--
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.administradores (id, nombre, "areaAsignada") FROM stdin;
8caa6187-5a91-4479-9284-8527ef63715c	Ana Torres	Zona Norte
23648be1-8ea2-4fdc-8e56-df3c2c14a25a	Carlos Ruiz	Zona Sur
\.


--
-- Data for Name: canchas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.canchas (id, nombre, tipo, "tarifaBasePorHora", activa, "horaAperturaDesde", "horaCierreHasta", "administradorId") FROM stdin;
f7610f25-17b7-41ae-b383-2f3b2366cc55	Cancha Fútbol 1	Futbol	15.00	t	08:00:00	22:00:00	8caa6187-5a91-4479-9284-8527ef63715c
131a3fd0-d087-41c1-a376-31b6d74f8a0c	Cancha Básquet 1	Basquet	10.00	t	09:00:00	21:00:00	8caa6187-5a91-4479-9284-8527ef63715c
82440803-6f1d-43da-bbfd-4da50d0fac0e	Cancha Comunitaria	Futbol	0.00	t	07:00:00	20:00:00	23648be1-8ea2-4fdc-8e56-df3c2c14a25a
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes (id, nombre, email, telefono) FROM stdin;
29ea4a11-adbb-4880-8bec-8306a30f3302	Juan Perez	juan.perez@test.com	0991111111
eaff6242-3bc3-4041-aa94-b3b97f39f136	Maria Lopez	maria.lopez@test.com	0992222222
9b6c3de9-cdf6-4eb5-a3af-5d94eced521f	Pedro Sanchez	pedro.sanchez@test.com	0993333333
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pagos (id, monto, "metodoPago", "procesadoEn", "reservaId") FROM stdin;
31b774a5-f863-4a09-9b8d-bbd67c38e032	30.00	TARJETA	2026-07-19 07:17:24.912	9a8f9c68-c3c6-4eda-835f-1419b1ab2ff7
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservas (id, estado, "horaInicio", "horaFin", "creadaEn", monto, "clienteId", "canchaId") FROM stdin;
9a8f9c68-c3c6-4eda-835f-1419b1ab2ff7	CONFIRMADA	2026-08-01 10:00:00	2026-08-01 12:00:00	2026-07-19 07:17:24.903365	30.00	29ea4a11-adbb-4880-8bec-8306a30f3302	f7610f25-17b7-41ae-b383-2f3b2366cc55
a1c0cda8-72a6-41fd-8462-a821ad498db8	PENDIENTE	2026-08-02 15:00:00	2026-08-02 16:00:00	2026-07-19 07:17:24.937888	10.00	eaff6242-3bc3-4041-aa94-b3b97f39f136	131a3fd0-d087-41c1-a376-31b6d74f8a0c
415d3041-47af-4969-a6d2-818afc41af67	CANCELADA	2026-08-03 09:00:00	2026-08-03 10:00:00	2026-07-19 07:17:24.943168	15.00	9b6c3de9-cdf6-4eb5-a3af-5d94eced521f	f7610f25-17b7-41ae-b383-2f3b2366cc55
\.


--
-- Name: reservas PK_309c659053bcf5e56f8e40a2b42; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "PK_309c659053bcf5e56f8e40a2b42" PRIMARY KEY (id);


--
-- Name: pagos PK_37321ca70a2ed50885dc205beb2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT "PK_37321ca70a2ed50885dc205beb2" PRIMARY KEY (id);


--
-- Name: administradores PK_6956c0b545649bba08e4099c81a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT "PK_6956c0b545649bba08e4099c81a" PRIMARY KEY (id);


--
-- Name: canchas PK_b0895a3e86f4558816d42e8b1d1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT "PK_b0895a3e86f4558816d42e8b1d1" PRIMARY KEY (id);


--
-- Name: clientes PK_d76bf3571d906e4e86470482c08; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT "PK_d76bf3571d906e4e86470482c08" PRIMARY KEY (id);


--
-- Name: pagos REL_6dfdd0be04377c89116537cc6b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT "REL_6dfdd0be04377c89116537cc6b" UNIQUE ("reservaId");


--
-- Name: clientes UQ_3cd5652ab34ca1a0a2c7a255313; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT "UQ_3cd5652ab34ca1a0a2c7a255313" UNIQUE (email);


--
-- Name: reservas FK_5ef21c9dc6a04f2128d062b7a25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "FK_5ef21c9dc6a04f2128d062b7a25" FOREIGN KEY ("canchaId") REFERENCES public.canchas(id);


--
-- Name: pagos FK_6dfdd0be04377c89116537cc6b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT "FK_6dfdd0be04377c89116537cc6b9" FOREIGN KEY ("reservaId") REFERENCES public.reservas(id);


--
-- Name: reservas FK_8ee0c58de71f30301e1b6994695; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "FK_8ee0c58de71f30301e1b6994695" FOREIGN KEY ("clienteId") REFERENCES public.clientes(id);


--
-- Name: canchas FK_fbe00cacb073eb48c42346220b0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT "FK_fbe00cacb073eb48c42346220b0" FOREIGN KEY ("administradorId") REFERENCES public.administradores(id);


--
-- PostgreSQL database dump complete
--


