--
-- PostgreSQL database dump
--

\restrict eHMBadFG3FppWkEFuT20GXgPkeIpV28F2tJEkCiJAFHibndTFEIgFtEMclVBSZA

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    icon character varying(50),
    color character varying(20)
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    payment_method_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    expense_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: category_expense_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.category_expense_summary AS
 SELECT c.name AS category,
    sum(e.amount) AS total_spent
   FROM (public.expenses e
     JOIN public.categories c ON ((e.category_id = c.id)))
  GROUP BY c.name;


--
-- Name: expense_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_audit (
    id integer NOT NULL,
    expense_id integer NOT NULL,
    action character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: expense_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_audit_id_seq OWNED BY public.expense_audit.id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(10)
);


--
-- Name: expense_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.expense_details AS
 SELECT expenses.id,
    users.name AS user_name,
    expenses.title,
    expenses.description,
    categories.name AS category,
    payment_methods.name AS payment_method,
    expenses.amount,
    expenses.expense_date
   FROM (((public.expenses
     JOIN public.users ON ((expenses.user_id = users.id)))
     JOIN public.categories ON ((expenses.category_id = categories.id)))
     JOIN public.payment_methods ON ((expenses.payment_method_id = payment_methods.id)));


--
-- Name: expense_report; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.expense_report AS
 SELECT e.id,
    e.title,
    e.description,
    e.amount,
    e.expense_date,
    u.name AS user_name,
    c.name AS category_name,
    pm.name AS payment_method_name,
    e.created_at
   FROM (((public.expenses e
     JOIN public.users u ON ((e.user_id = u.id)))
     LEFT JOIN public.categories c ON ((e.category_id = c.id)))
     LEFT JOIN public.payment_methods pm ON ((e.payment_method_id = pm.id)));


--
-- Name: expense_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.expense_summary AS
 SELECT c.name AS category,
    count(e.id) AS expense_count,
    sum(e.amount) AS total_spent
   FROM (public.expenses e
     JOIN public.categories c ON ((e.category_id = c.id)))
  GROUP BY c.name;


--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: expense_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_audit ALTER COLUMN id SET DEFAULT nextval('public.expense_audit_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, icon, color) FROM stdin;
1	Food	🍔	#FF6B6B
2	Transport	🚗	#4ECDC4
3	Entertainment	🎬	#96CEB4
4	Shopping	🛍️	#45B7D1
5	Bills	📄	#FFEAA7
7	Education	📚	#98D8C8
8	Other	📌	#A8A8A8
14	Healthcare	🏥	#DDA0DD
6	Health	❤️	#FF0000
\.


--
-- Data for Name: expense_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_audit (id, expense_id, action, created_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, user_id, category_id, payment_method_id, title, description, amount, expense_date, created_at) FROM stdin;
6	1	5	5	spent	furniture	100.00	2026-08-14	2026-08-14 20:25:19.842615
7	1	3	1	expense	cinema	320.00	2026-08-14	2026-08-14 20:26:12.622385
9	1	6	3	spent	hospital case	4200.00	2026-08-14	2026-08-14 20:26:52.002884
5	1	7	2	buy	book and 1 note	149.00	2026-08-14	2026-08-14 15:21:24.925377
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, name) FROM stdin;
1	Cash
2	UPI
3	Credit Card
4	Debit Card
5	Bank Transfer
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, phone) FROM stdin;
3	John Doe	john@example.com	\N
1	wafa fathima	wafa@example.com	\N
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 16, true);


--
-- Name: expense_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_audit_id_seq', 1, false);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expenses_id_seq', 9, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 15, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: expense_audit expense_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_audit
    ADD CONSTRAINT expense_audit_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_name_key UNIQUE (name);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_expenses_amount; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_amount ON public.expenses USING btree (amount);


--
-- Name: idx_expenses_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_category_id ON public.expenses USING btree (category_id);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (expense_date);


--
-- Name: idx_expenses_expense_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_expense_date ON public.expenses USING btree (expense_date);


--
-- Name: idx_expenses_payment_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_payment_method_id ON public.expenses USING btree (payment_method_id);


--
-- Name: idx_expenses_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_user_created ON public.expenses USING btree (user_id, created_at DESC);


--
-- Name: idx_expenses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);


--
-- Name: expense_audit expense_audit_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_audit
    ADD CONSTRAINT expense_audit_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: expenses expenses_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict eHMBadFG3FppWkEFuT20GXgPkeIpV28F2tJEkCiJAFHibndTFEIgFtEMclVBSZA

