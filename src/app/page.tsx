import LandingHeader from '@/components/layout/LandingHeader'
import { Container, Row, Col } from 'react-bootstrap'

// Componente principal da landing page
function LandingPage() {
  // Ano atual para o footer
  const currentYear = new Date().getFullYear()

  return (
    // Div principal com classe CSS personalizada
    <div className="landing-page">
      {/* Cabeçalho da página */}
      <LandingHeader />
      
      {/* Seção principal */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="mb-5 mb-lg-0">
              {/* Conteúdo textual da esquerda */}
              <div className="hero-content">
                <h1 className="hero-title mb-4">
                  Sistema de Revistas
                  <span className="text-primary"> Científicas</span>
                </h1>
                <p className="hero-description mb-4">
                  Acesse o acervo completo de revistas científicas da Editora Pasteur. 
                  Pesquise, leia e baixe artigos acadêmicos de qualidade com facilidade.
                </p>
                
                {/* Estatísticas rápidas */}
                <div className="hero-stats mb-4">
                  <Row>
                    <Col xs={4} className="text-center">
                      <div className="stat-item">
                        <h3 className="stat-number">500+</h3>
                        <p className="stat-label">Artigos</p>
                      </div>
                    </Col>
                    <Col xs={4} className="text-center">
                      <div className="stat-item">
                        <h3 className="stat-number">50+</h3>
                        <p className="stat-label">Revistas</p>
                      </div>
                    </Col>
                    <Col xs={4} className="text-center">
                      <div className="stat-item">
                        <h3 className="stat-number">1000+</h3>
                        <p className="stat-label">Autores</p>
                      </div>
                    </Col>
                  </Row>
                </div>
                
                {/* Botões de ação */}
                <div className="hero-buttons">
                  <a 
                    href="/dashboards/analytics" 
                    className="btn btn-primary btn-lg me-3 mb-2"
                  >
                    <i className="fas fa-search me-2"></i>
                    Pesquisar Artigos
                  </a>
                  <a 
                    href="/auth/sign-up" 
                    className="btn btn-outline-primary btn-lg mb-2"
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Criar Conta
                  </a>
                </div>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="hero-image-placeholder">
                <div className="placeholder-content">
                  <i className="fas fa-book-open fa-5x text-primary mb-3"></i>
                  <h3 className="text-muted">Sistema de Revistas</h3>
                  <p className="text-muted">Editora Pasteur</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Seção de Recursos */}
      <section className="features-section py-5">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h2 className="section-title mb-3">Por que escolher nosso sistema?</h2>
              <p className="section-subtitle">
                Ferramentas avançadas para pesquisa e acesso a conteúdo científico de qualidade
              </p>
            </Col>
          </Row>
          
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card h-100 border-0 shadow-sm">
                <div className="feature-card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-search fa-3x text-primary"></i>
                  </div>
                  <h5 className="feature-title mb-3">Pesquisa Avançada</h5>
                  <p className="feature-description">
                    Encontre artigos por título, autor, palavras-chave ou área de conhecimento com nossa ferramenta de busca inteligente.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card h-100 border-0 shadow-sm">
                <div className="feature-card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-download fa-3x text-primary"></i>
                  </div>
                  <h5 className="feature-title mb-3">Acesso aos Artigos</h5>
                  <p className="feature-description">
                    Acesse artigos científicos da Editora Pasteur através de nossa plataforma digital.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card h-100 border-0 shadow-sm">
                <div className="feature-card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-mobile-alt fa-3x text-primary"></i>
                  </div>
                  <h5 className="feature-title mb-3">Acesso Mobile</h5>
                  <p className="feature-description">
                    Pesquise e leia artigos em qualquer dispositivo. Interface responsiva que se adapta a smartphones e tablets.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card h-100 border-0 shadow-sm">
                <div className="feature-card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-book fa-3x text-primary"></i>
                  </div>
                  <h5 className="feature-title mb-3">Revistas Científicas</h5>
                  <p className="feature-description">
                    Acesse as revistas científicas da Editora Pasteur em uma única plataforma.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card h-100 border-0 shadow-sm">
                <div className="feature-card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-chart-line fa-3x text-primary"></i>
                  </div>
                  <h5 className="feature-title mb-3">Estatísticas</h5>
                  <p className="feature-description">
                    Visualize estatísticas de acesso e informações sobre os artigos publicados.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} md={6} className="mb-4">
              <div className="feature-card h-100 border-0 shadow-sm">
                <div className="feature-card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-users fa-3x text-primary"></i>
                  </div>
                  <h5 className="feature-title mb-3">Gestão de Usuários</h5>
                  <p className="feature-description">
                    Sistema de gestão de usuários para administradores e pesquisadores.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Seção CTA (Call to Action) */}
      <section className="cta-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="cta-card border-0 shadow-lg">
                <div className="cta-card-body p-5">
                  <h2 className="cta-title mb-3">Comece sua pesquisa hoje mesmo!</h2>
                  <p className="cta-description mb-4">
                    Acesse o sistema de revistas da Editora Pasteur e descubra artigos científicos de qualidade.
                  </p>
                  <div className="cta-buttons">
                    <a 
                      href="/auth/sign-up" 
                      className="btn btn-primary btn-lg"
                    >
                      <i className="fas fa-rocket me-2"></i>
                      Começar Agora
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Rodapé da página */}
      <footer className="footer-section">
        <Container>
          <Row className="text-center">
            <Col>
              <p className="footer-text mb-0">
                © {currentYear} Editora Pasteur. Todos os direitos reservados.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  )
}

export default LandingPage