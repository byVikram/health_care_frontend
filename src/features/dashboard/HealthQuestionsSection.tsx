// src/features/dashboard/HealthQuestionsSection.tsx
import { Box, Typography, Container, Avatar, Grid } from '@mui/material'

const questions = [
  {
    id: 1,
    gender: 'Female',
    age: '30 Years',
    location: 'Bengaluru',
    time: '1d ago',
    question: 'Chance of esophageal cancer?',
    description:
      '2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
    answers: 10,
    avatar: 'https://i.pravatar.cc/40?img=47',
  },
  {
    id: 2,
    gender: 'Female',
    age: '30 Years',
    location: 'Bengaluru',
    time: '1d ago',
    question: 'Chance of esophageal cancer?',
    description:
      '2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
    answers: 10,
    avatar: 'https://i.pravatar.cc/40?img=48',
  },
  {
    id: 3,
    gender: 'Female',
    age: '30 Years',
    location: 'Bengaluru',
    time: '1d ago',
    question: 'Chance of esophageal cancer?',
    description:
      '2 months ago i vomited with 1.5 cup blood, some days ago i had severe heart burn and difficulty swallowing. The swallowing diffi...',
    answers: 10,
    avatar: 'https://i.pravatar.cc/40?img=49',
  },
]

export default function HealthQuestionsSection() {
  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 4, lineHeight: 1.3 }}>
          Health expert answers to your health questions
        </Typography>

        {/* 3 Question Cards */}
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          {questions.map((q) => (
            <Grid key={q.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  height: '100%',
                  bgcolor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
                }}
              >
              {/* Top: Avatar + Info + Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={q.avatar} sx={{ width: 40, height: 40 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }}>
                    Asked for {q.gender},
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                    {q.age}, {q.location}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{q.time}</Typography>
              </Box>

              {/* Question */}
              <Typography
                sx={{ fontWeight: 700, fontSize: '15px', color: 'text.primary', lineHeight: 1.4 }}
              >
                {q.question}
              </Typography>

              {/* Description */}
              <Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.5, flex: 1 }}>
                {q.description}
              </Typography>

              {/* Bottom: Answers + Doctor Avatars */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #f0f0f0',
                  pt: 1.5,
                  mt: 'auto',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
                    {q.answers} answers
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                    from doctors
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src="https://i.pravatar.cc/30?img=12"
                    sx={{ width: 28, height: 28, border: '2px solid #fff' }}
                  />
                  <Avatar
                    src="https://i.pravatar.cc/30?img=13"
                    sx={{ width: 28, height: 28, border: '2px solid #fff', ml: -1 }}
                  />
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: '#0c7c7c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: -1,
                      border: '2px solid #fff',
                    }}
                  >
                    <Typography sx={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>
                      6+
                    </Typography>
                  </Box>
                </Box>
              </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Ask a free question button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              px: { xs: 3, sm: 6 },
              py: 1.5,
              cursor: 'pointer',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
              transition: 'box-shadow 0.2s ease',
              '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
            }}
          >
            <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'text.primary' }}>
              Ask a free quetion
            </Typography>
          </Box>

          {/* Read more link */}
          <Typography
            sx={{
              fontSize: '14px',
              color: '#0c7c7c',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { opacity: 0.8 },
            }}
          >
            Read more trending quetions
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
