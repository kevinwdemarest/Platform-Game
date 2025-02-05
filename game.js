// game.js - Hybrid platformer game engine (Desktop + Mobile)
class Game {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Make canvas fill the screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        
        this.player = {
            x: 100,
            y: 100,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            isJumping: false
        };
        
        this.gravity = 0.5;
        this.jumpForce = -12;
        this.moveSpeed = 5;
        
        // Input state
        this.input = {
            left: false,
            right: false,
            jump: false
        };
        
        // Platform data - adjusted for screen
        this.platforms = [
            { x: 0, y: this.canvas.height - 50, width: this.canvas.width, height: 50 },
            { x: this.canvas.width * 0.3, y: this.canvas.height * 0.7, width: 200, height: 20 },
            { x: this.canvas.width * 0.1, y: this.canvas.height * 0.5, width: 200, height: 20 }
        ];
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Touch event listeners
        this.canvas.addEventListener('touchstart', this.handleTouch);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        
        // Keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // Adjust platform positions on resize
            this.platforms[0].width = this.canvas.width;
            this.platforms[0].y = this.canvas.height - 50;
            this.platforms[1].x = this.canvas.width * 0.3;
            this.platforms[1].y = this.canvas.height * 0.7;
            this.platforms[2].x = this.canvas.width * 0.1;
            this.platforms[2].y = this.canvas.height * 0.5;
        });
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    handleKeyDown(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.input.left = true;
                break;
            case 'ArrowRight':
                this.input.right = true;
                break;
            case 'Space':
                this.input.jump = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.code) {
            case 'ArrowLeft':
                this.input.left = false;
                break;
            case 'ArrowRight':
                this.input.right = false;
                break;
            case 'Space':
                this.input.jump = false;
                break;
        }
    }
    
    handleTouch(e) {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const x = touch.clientX;
        
        // Divide screen into three sections
        if (x < this.canvas.width / 3) {
            // Left third of screen - move left
            this.input.left = true;
            this.input.right = false;
        } else if (x > (this.canvas.width * 2) / 3) {
            // Right third of screen - move right
            this.input.right = true;
            this.input.left = false;
        } else {
            // Middle third of screen - jump
            this.input.jump = true;
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        // Stop all touch inputs
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;
    }
    
    update() {
        // Handle movement based on input state
        if (this.input.left) {
            this.player.velocityX = -this.moveSpeed;
        } else if (this.input.right) {
            this.player.velocityX = this.moveSpeed;
        } else {
            this.player.velocityX = 0;
        }
        
        // Handle jumping
        if (this.input.jump && !this.player.isJumping) {
            this.player.velocityY = this.jumpForce;
            this.player.isJumping = true;
        }
        
        // Apply gravity
        this.player.velocityY += this.gravity;
        
        // Update position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Basic boundary checking
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Reset jumping status
        this.player.isJumping = true;
        
        // Check collisions with platforms
        for (let platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // Collision from above
                if (this.player.velocityY > 0 &&
                    this.player.y + this.player.height - this.player.velocityY <= platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isJumping = false;
                }
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
        
        // Draw platforms
        this.ctx.fillStyle = '#888888';
        for (let platform of this.platforms) {
            this.ctx.fillRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
        }
        
        // Draw touch control indicators on mobile devices
        if ('ontouchstart' in window) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width / 3, this.canvas.height);
            this.ctx.fillRect((this.canvas.width * 2) / 3, 0, this.canvas.width / 3, this.canvas.height);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
};