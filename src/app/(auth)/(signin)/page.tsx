'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Stethoscope,
  Shield,
  MapPin,
  Star,
  User,
  ChevronRight,
  Play,
  Check,
  Phone,
  Mail,
  Globe,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from "@/components/motion";
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { toast } from 'sonner';
import axios from 'axios';

// Variantes d'animation pour différents éléments
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

const slideFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.7 } }
};

const slideFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.7 } }
};

const listItemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: i * 0.1 }
  })
};

export default function Page() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);

    try {
      // Utiliser l'instance apiClient configurée au lieu d'axios directement
      await apiClient.post(apiRoutes.guest.addGuest, { email });
      setLoading(false);
      setSubscribed(true);
      setEmail('');
      toast.success("Votre email a été enregistré avec succès.");
    } catch (error: any) {
      setLoading(false);
      console.error("Erreur lors de l'ajout du guest:", error);

      // Ajout de log pour déboguer
      console.log("URL appelée:", apiRoutes.guest.addGuest);
      console.log("Détails de l'erreur:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Gestion des erreurs
      if (error.response?.data?.message === "The email has already been taken." ||
        error.response?.data?.errors?.email?.[0] === "The email has already been taken.") {
        toast.error("Cet email est déjà enregistré dans notre système.");
      } else {
        // Message d'erreur plus précis
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          "Une erreur est survenue. Veuillez réessayer plus tard.";
        toast.error(errorMessage);
      }
    }
  };
  return (
    <div className="relative bg-white" style={{ minHeight: '100vh' }}>
      <div className="absolute inset-0 overflow-y-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
            >
              <Stethoscope className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900">ConsultNow</span>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/auth/login"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-4 py-2 border rounded-md"
            >
              Connexion
            </Link>
          </motion.div>
        </motion.header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-emerald-50 to-white py-20 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Trouvez & Consultez Votre{' '}
                  <motion.span
                    className="text-emerald-500 underline decoration-emerald-500"
                    animate={{
                      textShadow: ["0px 0px 0px rgba(16, 185, 129, 0)", "0px 0px 10px rgba(16, 185, 129, 0.5)", "0px 0px 0px rgba(16, 185, 129, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Médecin
                  </motion.span>{' '}
                  Préféré
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  ConsultNow vous permet de trouver un médecin à tout moment, n'importe où.
                  Nous avons créé une plateforme pour que vous puissiez consulter
                  des professionnels de santé qualifiés en quelques clics.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="flex flex-col space-y-2">
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre adresse email"
                    className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-l-full px-4 py-3"
                    disabled={loading || subscribed}
                  />
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-r-full px-6 py-3"
                    disabled={loading || subscribed}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                  </Button>
                </motion.div>
                {subscribed && (
                  <p className="text-emerald-600 text-sm">
                    Merci! Vous recevrez bientôt de nos nouvelles.
                  </p>
                )}
              </form>

              {/* Stats */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex items-center space-x-8 pt-8"
              >
                <motion.div variants={fadeIn} className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-gray-900"
                    whileInView={{
                      scale: [1, 1.2, 1],
                      transition: { duration: 0.6, delay: 0.3 }
                    }}
                  >24/7</motion.div>
                  <div className="text-gray-600 text-sm">Disponible</div>
                </motion.div>
                <motion.div variants={fadeIn} className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-gray-900"
                    whileInView={{
                      scale: [1, 1.2, 1],
                      transition: { duration: 0.6, delay: 0.4 }
                    }}
                  >100+</motion.div>
                  <div className="text-gray-600 text-sm">Médecins</div>
                </motion.div>
                <motion.div variants={fadeIn} className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-gray-900"
                    whileInView={{
                      scale: [1, 1.2, 1],
                      transition: { duration: 0.6, delay: 0.5 }
                    }}
                  >1M+</motion.div>
                  <div className="text-gray-600 text-sm">Patients</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Doctor Image */}
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideFromRight}
            >
              <div className="absolute inset-0 bg-emerald-500 rounded-t-full h-54 mt-47 transform translate-x-12 translate-y-12"></div>
              <motion.div
                className="relative z-10"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="images/im13.png"
                  alt="Docteur"
                  className="w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Specialists Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center text-gray-900 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
              Nos Spécialités Médicales
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div variants={scaleIn} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-emerald-500 bg-emerald-50">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">Test COVID-19</h3>
                    <p className="text-gray-600 text-sm">
                      Tests PCR et antigéniques réalisés par des professionnels avec résultats rapides.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="bg-emerald-500 text-white">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Heart className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                    <h3 className="font-bold mb-2">Cardiologie</h3>
                    <p className="text-emerald-100 text-sm">
                      Consultation avec des cardiologues pour le suivi des maladies cardiaques.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card>
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Stethoscope className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">Médecine Générale</h3>
                    <p className="text-gray-600 text-sm">
                      Consultations pour tous vos problèmes de santé courants avec des généralistes.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card>
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <MapPin className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                    <h3 className="font-bold text-gray-900 mb-2">Santé Mentale</h3>
                    <p className="text-gray-600 text-sm">
                      Psychiatres et psychologues disponibles pour un soutien mental et émotionnel.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideFromLeft}
            >
              <img
                src="images/im12.png"
                alt="Consultation médicale"
                className="rounded-2xl shadow-lg"
              />
            </motion.div>

            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold text-gray-900">
                Pourquoi Nous Choisir ?
              </h2>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  "Accès 24h/24 à des professionnels de santé",
                  "Médecins diplômés et spécialistes",
                  "Consultations sécurisées et confidentielles",
                  "Interface simple et intuitive",
                  "Rendez-vous rapides et soins immédiats"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    custom={index}
                    variants={listItemVariant}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Check className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                <Button variant="link" className="text-emerald-600 p-0">
                  En savoir plus <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                className="space-y-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Ce que <span className="text-emerald-500">nos patients</span><br />
                    disent de nous
                  </h2>
                  <p className="text-gray-600">
                    Découvrez les témoignages de nos patients satisfaits par notre service.
                  </p>
                </div>

                <motion.div
                  className="flex items-center space-x-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex -space-x-2">
                    {['images/avatar1.png', 'images/avatar2.png', 'images/avatar3.png', 'images/avatar4.png', 'images/avatar5.png'].map((src, i) => (
                      <motion.img
                        key={i}
                        src={src}
                        alt={`Avatar ${i + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-white"
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">100+ Avis</div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={slideFromRight}
              >
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <motion.div
                        className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <User className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="font-bold text-gray-900">Marie Dupont</div>
                        <div className="text-gray-500 text-sm">Enseignante</div>
                      </div>
                      <motion.div
                        className="flex space-x-1 ml-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    <p className="text-gray-600">
                      "J'ai pu consulter un médecin en urgence à 22h sans me déplacer. Le diagnostic était clair et le traitement efficace. Un service vraiment pratique pour les mamans pressées comme moi !"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Future of Health Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold text-gray-900">
                L'avenir<br />
                de la <span className="text-emerald-500">santé connectée</span>
              </h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ staggerChildren: 0.3 }}
                viewport={{ once: true }}
              >
                {[
                  "ConsultNow est votre plateforme de télémédecine pour des soins professionnels instantanés depuis le confort de votre domicile — sans salle d'attente, sans stress. Prenez rendez-vous, discutez en ligne et connectez-vous facilement avec des médecins.",
                  "Avec une interface conviviale et multilingue, vos données médicales sont chiffrées sur des serveurs sécurisés conformes aux réglementations de santé — garantissant la confidentialité de vos informations.",
                  "La santé n'a jamais été aussi accessible, abordable et réactive — reprenez le contrôle de votre bien-être en quelques clics."
                ].map((paragraph, i) => (
                  <motion.p
                    key={i}
                    className="text-gray-600 leading-relaxed"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.6, delay: i * 0.2 }
                      }
                    }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </motion.div>

              <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                <Button variant="link" className="text-emerald-600 p-0">
                  En savoir plus <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideFromRight}
            >
              <motion.img
                src="images/im11.png"
                alt="Consultation médicale"
                className="rounded-2xl shadow-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-emerald-500 text-white">
                <CardContent className="p-12 text-center">
                  <motion.h2
                    className="text-3xl font-bold mb-8"
                    animate={{
                      scale: [1, 1.05, 1],
                      transition: { duration: 2, repeat: Infinity }
                    }}
                  >
                    Rejoignez-nous
                  </motion.h2>
                  <form onSubmit={handleEmailSubmit}>
                    <motion.div
                      className="flex max-w-md mx-auto"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Entrez votre adresse email"
                        className="bg-white text-gray-900 border-none rounded-l-full"
                        disabled={loading || subscribed}
                      />
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          className="bg-emerald-700 hover:bg-emerald-800 rounded-r-full px-8"
                          disabled={loading || subscribed}
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-emerald-600 text-white py-16 px-6">
          <motion.div
            className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div
              className="space-y-4"
              variants={fadeIn}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                </motion.div>
                <span className="text-xl font-bold">ConsultNow</span>
              </div>
              <p className="text-emerald-100">
                Plateforme de télémédecine leader en France pour des consultations médicales
                accessibles à tous, partout et à tout moment.
              </p>
              <p className="text-emerald-100">
                Notre mission : démocratiser l'accès aux soins de qualité grâce à la technologie.
              </p>
              <div className="flex space-x-4">
                {[Globe, Mail, Phone].map((Icon, index) => (
                  <motion.div
                    key={index}
                    className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <h3 className="font-bold mb-4">Liens utiles</h3>
              <div className="space-y-2">
                {["À propos", "Politique de confidentialité", "Notre mission", "Notre équipe"].map((link, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="block text-emerald-100 hover:text-white"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <h3 className="font-bold mb-4">Adresse</h3>
              <div className="space-y-2 text-emerald-100">
                <p>15 Rue de la Santé</p>
                <p>75013 Paris</p>
                <p>France</p>
              </div>
            </motion.div>

            <motion.div
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-emerald-500 rounded-lg h-32 flex items-center justify-center">
                <a
                  href="https://www.google.com/maps/place/15+Rue+de+la+Sant%C3%A9,+75013+Paris,+France"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <img
                    src="/images/img.png"
                    alt="Capture d'écran de l'adresse dans Google Maps"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="max-w-6xl mx-auto pt-8 mt-8 border-t border-emerald-500 text-center text-emerald-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            © 2025 Tous droits réservés
          </motion.div>
        </footer>
      </div>
    </div>
  );
}