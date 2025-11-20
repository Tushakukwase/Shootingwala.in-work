"use client"

import { motion } from "framer-motion"
import { Award, Camera, Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PhotographerAboutProps {
  photographer: {
    bio: string
    experience: number
    specializations: string[]
    awards: (string | {
      id?: string
      title: string
      image?: string
      brief?: string
      year?: string
    })[]
    studioInfo?: {
      studioName: string
      studioAddress: string
      studioCity: string
      studioState: string
      studioEstablished: string
      studioTeamSize: number
      studioServices: string[]
      businessHours: any
    }
  }
}

export default function PhotographerAbout({ photographer }: PhotographerAboutProps) {
  const hasContent = (
    (photographer.bio && photographer.bio.trim() !== '') ||
    (photographer.experience && photographer.experience > 0) ||
    (photographer.specializations && photographer.specializations.length > 0) ||
    (photographer.awards && photographer.awards.length > 0) ||
    (photographer.studioInfo && photographer.studioInfo.studioName)
  )

  if (!hasContent) {
    return null
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Camera className="w-6 h-6 text-primary" />
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio */}
          {typeof photographer.bio === 'string' && photographer.bio.trim() !== '' && (
            <div>
              <p className="text-gray-700 leading-relaxed text-lg text-justify" style={{ lineHeight: '1.8' }}>
                {photographer.bio}
              </p>
            </div>
          )}

          {/* Experience */}
          {typeof photographer.experience === 'number' && photographer.experience > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {photographer.experience} years of professional experience
              </span>
            </div>
          )}

          {/* Specializations */}
          {Array.isArray(photographer.specializations) && photographer.specializations.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {photographer.specializations.map((specialization, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {typeof specialization === 'string' ? specialization : 'Photography'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Awards - Only show if awards exist */}
          {Array.isArray(photographer.awards) && photographer.awards.length > 0 && (photographer.awards.some(award => typeof award === 'string' ? award.trim() !== '' : award.title?.trim() !== '')) && (
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Awards & Recognition
              </h3>
              <div className="flex flex-wrap gap-2">
                {photographer.awards.map((award, index) => {
                  // Handle both string and object awards
                  const isString = typeof award === 'string'
                  const title = isString ? award : award.title
                  const image = !isString && award.image ? award.image : null
                  const brief = !isString && award.brief ? award.brief : null
                  const year = !isString && award.year ? award.year : null
                  
                  // Skip empty awards
                  if (!title || title.trim() === '') return null
                  
                  return (
                    <div 
                      key={index} 
                      className="w-[200px] border rounded-lg p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-md transition-shadow"
                    >
                      {image && (
                        <div className="mb-2">
                          <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex items-start gap-1.5">
                        {!image && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <h4 className="font-semibold text-sm text-gray-900 leading-tight truncate">{title}</h4>
                            {year && (
                              <span className="text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded flex-shrink-0">{year}</span>
                            )}
                          </div>
                          {brief && (
                            <p className="text-xs text-gray-700 line-clamp-2">{brief}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Studio Information */}
          {photographer.studioInfo && photographer.studioInfo.studioName && (
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Studio Information
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{photographer.studioInfo.studioName}</h4>
                  {photographer.studioInfo.studioAddress && (
                    <p className="text-sm text-gray-600">
                      {photographer.studioInfo.studioAddress}
                      {photographer.studioInfo.studioCity && `, ${photographer.studioInfo.studioCity}`}
                      {photographer.studioInfo.studioState && `, ${photographer.studioInfo.studioState}`}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {photographer.studioInfo.studioEstablished && (
                    <div>
                      <span className="font-medium text-gray-700">Established:</span>
                      <p className="text-gray-600">{photographer.studioInfo.studioEstablished}</p>
                    </div>
                  )}
                  {photographer.studioInfo.studioTeamSize && (
                    <div>
                      <span className="font-medium text-gray-700">Team Size:</span>
                      <p className="text-gray-600">{photographer.studioInfo.studioTeamSize} members</p>
                    </div>
                  )}
                </div>

                {photographer.studioInfo.studioServices && photographer.studioInfo.studioServices.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 text-sm">Studio Services:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photographer.studioInfo.studioServices.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}