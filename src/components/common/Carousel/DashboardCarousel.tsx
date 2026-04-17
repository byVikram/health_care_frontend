import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Pagination, Autoplay } from 'swiper/modules'
import { Box } from '@mui/material'

type Props = {
  images: string[]
}

export default function DoctorCarousel({ images }: Props) {
  return (
    <Box>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt="carousel"
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}